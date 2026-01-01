/**
 * Casso Webhook Handler
 *
 * Receives bank transaction notifications from Casso
 * Auto-confirms consultation bookings when payment matches
 *
 * Setup Casso:
 * 1. Go to https://my.casso.vn/
 * 2. Add bank account (ACB - 10141347)
 * 3. Create webhook: https://your-domain.com/api/casso/webhook
 * 4. Copy Secure Token and add to .env as CASSO_WEBHOOK_SECRET
 */

const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * POST /api/casso/webhook
 * Receives transaction notifications from Casso
 *
 * Casso sends:
 * {
 *   "error": 0,
 *   "data": [{
 *     "id": 123456,
 *     "tid": "FT24363...",
 *     "description": "TUVAN SANGVOLON 29122025",
 *     "amount": 499000,
 *     "cusum_balance": 1000000,
 *     "when": "2024-12-29 14:30:00"
 *   }]
 * }
 */
router.post("/webhook", async (req, res) => {
  try {
    // Verify webhook secret (optional but recommended)
    const cassoSecret = process.env.CASSO_WEBHOOK_SECRET;
    const receivedSecret = req.headers["secure-token"];

    if (cassoSecret && receivedSecret !== cassoSecret) {
      console.warn("[Casso] Invalid webhook secret");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { error, data: transactions } = req.body;

    if (error !== 0 || !transactions || !Array.isArray(transactions)) {
      console.warn("[Casso] Invalid webhook payload:", req.body);
      return res.status(400).json({ error: "Invalid payload" });
    }

    console.log(`[Casso] Received ${transactions.length} transaction(s)`);

    const results = [];

    for (const tx of transactions) {
      const { id, tid, description, amount, when } = tx;

      console.log(`[Casso] Processing: ${description} - ${amount}đ`);

      // Extract payment reference from description
      // Format: "TUVAN [NAME] [DATE]" e.g., "TUVAN SANGVOLON 29122025"
      const paymentRef = extractPaymentRef(description);

      if (!paymentRef) {
        console.log(`[Casso] No payment ref found in: ${description}`);
        results.push({ id, status: "skipped", reason: "No payment ref" });
        continue;
      }

      // Find matching pending consultation
      const matchResult = await matchAndConfirmBooking(paymentRef, amount, {
        transaction_id: tid,
        casso_id: id,
        paid_at: when,
      });

      results.push({ id, ...matchResult });
    }

    res.json({ success: true, processed: results });
  } catch (error) {
    console.error("[Casso] Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Extract payment reference from transaction description
 * Looking for pattern: TUVAN + name + date
 */
function extractPaymentRef(description) {
  if (!description) return null;

  // Normalize: uppercase, remove extra spaces
  const normalized = description.toUpperCase().replace(/\s+/g, " ").trim();

  // Match "TUVAN" followed by anything
  const match = normalized.match(/TUVAN\s*(\S+)\s*(\d{6,8})?/);

  if (match) {
    return {
      full: match[0].replace(/\s+/g, ""),
      name: match[1],
      date: match[2] || null,
    };
  }

  return null;
}

/**
 * Match payment reference with pending booking and confirm it
 */
async function matchAndConfirmBooking(paymentRef, amount, txInfo) {
  if (!supabase) {
    console.error("[Casso] Supabase not configured");
    return { status: "error", reason: "Database not configured" };
  }

  try {
    // Find pending consultations that match:
    // 1. Status = pending
    // 2. Payment ref matches (stored in notes or a dedicated field)
    // 3. Amount matches (with some tolerance for bank fees)

    const { data: consultations, error: fetchError } = await supabase
      .from("consultations")
      .select("*")
      .eq("status", "pending")
      .or(`payment_status.eq.pending,payment_status.is.null`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error("[Casso] Fetch error:", fetchError);
      return { status: "error", reason: fetchError.message };
    }

    // Find matching consultation
    let matched = null;

    for (const consultation of consultations || []) {
      // Generate expected payment ref for this consultation
      const expectedRef = generatePaymentRef(
        consultation.client_name,
        consultation.consultation_date
      );

      // Check if transaction description contains our reference
      if (paymentRef.full.includes(expectedRef) || expectedRef.includes(paymentRef.name)) {
        // Verify amount (allow 1% tolerance for potential bank fees)
        const expectedAmount = getConsultationPrice(consultation.consultation_type);
        const amountMatches = Math.abs(amount - expectedAmount) <= expectedAmount * 0.01;

        if (amountMatches || expectedAmount === 0) {
          matched = consultation;
          break;
        }
      }
    }

    if (!matched) {
      console.log(`[Casso] No matching consultation for: ${paymentRef.full}`);
      return { status: "no_match", reason: "No matching pending consultation" };
    }

    // Update consultation status
    const { error: updateError } = await supabase
      .from("consultations")
      .update({
        status: "confirmed",
        payment_status: "paid",
        payment_transaction_id: txInfo.transaction_id,
        payment_confirmed_at: txInfo.paid_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", matched.id);

    if (updateError) {
      console.error("[Casso] Update error:", updateError);
      return { status: "error", reason: updateError.message };
    }

    console.log(`[Casso] ✅ Confirmed booking: ${matched.id} for ${matched.client_name}`);

    // Create Google Calendar event
    await createCalendarEvent(matched);

    // Send confirmation emails
    await sendPaymentConfirmationEmails(matched);

    return {
      status: "confirmed",
      consultation_id: matched.id,
      client_name: matched.client_name,
    };
  } catch (error) {
    console.error("[Casso] Match error:", error);
    return { status: "error", reason: error.message };
  }
}

/**
 * Generate payment reference from consultation data
 */
function generatePaymentRef(clientName, consultationDate) {
  const name = clientName
    .replace(/\s+/g, "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .slice(0, 10);

  const date = consultationDate.replace(/-/g, "");

  return `TUVAN${name}${date}`;
}

/**
 * Get consultation price by type
 */
function getConsultationPrice(consultationType) {
  const prices = {
    "Gói Cơ Bản (30 phút)": 299000,
    "Gói Tiêu Chuẩn (60 phút)": 499000,
    "Gói Premium (120 phút)": 999000,
    "Tư vấn miễn phí (15 phút)": 0,
  };

  return prices[consultationType] || 0;
}

/**
 * Send confirmation emails to client and admin
 */
async function sendPaymentConfirmationEmails(consultation) {
  const edgeFnUrl = `${supabaseUrl}/functions/v1/send-email`;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!anonKey) {
    console.warn("[Casso] No Supabase anon key for emails");
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
  };

  // Email to client
  try {
    await fetch(edgeFnUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        to: consultation.client_email,
        template: "paymentConfirmed",
        data: {
          name: consultation.client_name,
          date: consultation.consultation_date,
          time: consultation.start_time,
          type: consultation.consultation_type,
        },
      }),
    });
    console.log("[Casso] Payment confirmation email sent to client");
  } catch (err) {
    console.warn("[Casso] Client email failed:", err.message);
  }

  // Email to admin
  try {
    await fetch(edgeFnUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        to: "longsangsabo@gmail.com",
        template: "adminPaymentConfirmed",
        data: {
          name: consultation.client_name,
          email: consultation.client_email,
          date: consultation.consultation_date,
          time: consultation.start_time,
          type: consultation.consultation_type,
          amount: getConsultationPrice(consultation.consultation_type),
        },
      }),
    });
    console.log("[Casso] Payment confirmation email sent to admin");
  } catch (err) {
    console.warn("[Casso] Admin email failed:", err.message);
  }
}

/**
 * Create Google Calendar event for confirmed consultation
 */
async function createCalendarEvent(consultation) {
  const calendarEmail = process.env.GOOGLE_CALENDAR_EMAIL || "longsangsabo@gmail.com";
  const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3001";

  try {
    // Calculate end time based on consultation type
    const durationMinutes = getDurationFromType(consultation.consultation_type);
    // Handle both HH:MM and HH:MM:SS formats
    const startTimeParts = consultation.start_time.split(":");
    const hours = Number(startTimeParts[0]);
    const minutes = Number(startTimeParts[1]);
    const endMinutes = hours * 60 + minutes + durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
    const startTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

    const event = {
      summary: `📅 Tư vấn: ${consultation.client_name}`,
      description: `Khách hàng: ${consultation.client_name}
Email: ${consultation.client_email}
SĐT: ${consultation.client_phone || "Chưa cung cấp"}
Gói: ${consultation.consultation_type}
Ghi chú: ${consultation.notes || "Không có"}

---
Lịch này được tạo tự động bởi Long Sang Forge.`,
      start: {
        dateTime: `${consultation.consultation_date}T${startTime}:00`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: `${consultation.consultation_date}T${endTime}:00`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      attendees: [{ email: consultation.client_email }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    console.log(
      `[Casso] Creating calendar event at: ${apiBaseUrl}/api/google/calendar/create-event`
    );
    console.log(
      `[Casso] Event data:`,
      JSON.stringify({ calendarEmail, summary: event.summary, start: event.start })
    );

    const response = await fetch(`${apiBaseUrl}/api/google/calendar/create-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendarEmail, event }),
    });

    console.log(`[Casso] Calendar API response status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();

      // Update consultation with calendar event ID
      const updateResult = await supabase
        .from("consultations")
        .update({ calendar_event_id: data.id })
        .eq("id", consultation.id);

      console.log(`[Casso] ✅ Calendar event created: ${data.id}`);
      console.log(`[Casso] DB update result:`, updateResult.error || "success");
      return data;
    } else {
      const error = await response.text();
      console.warn(`[Casso] Calendar event creation failed: ${error}`);
    }
  } catch (err) {
    console.warn("[Casso] Calendar event error:", err.message, err.stack);
  }
}

/**
 * Get duration in minutes from consultation type
 */
function getDurationFromType(consultationType) {
  const durations = {
    "Gói Cơ Bản (30 phút)": 30,
    "Gói Tiêu Chuẩn (60 phút)": 60,
    "Gói Premium (120 phút)": 120,
    "Tư vấn miễn phí (15 phút)": 15,
  };
  return durations[consultationType] || 60;
}

/**
 * GET /api/casso/test
 * Test endpoint to verify webhook is reachable
 */
router.get("/test", (req, res) => {
  res.json({
    status: "ok",
    message: "Casso webhook is ready",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
