import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-casso-signature",
};

// Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin email
const ADMIN_EMAIL = "longsangsabo@gmail.com";

/**
 * Remove Vietnamese diacritics for name matching
 */
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Casso Webhook V2 Handler
 *
 * Receives bank transaction notifications from Casso Webhook V2
 * Auto-confirms consultation bookings when payment matches
 *
 * Webhook V2 format from Casso:
 * Headers: X-Casso-Signature: t=timestamp,v1=signature
 * Body:
 * {
 *   "error": 0,
 *   "data": {
 *     "id": 0,
 *     "reference": "BANK_REF_ID",
 *     "description": "TUVAN NGUYEN VAN A 30122025",
 *     "amount": 499000,
 *     "runningBalance": 25000000,
 *     "transactionDateTime": "2025-12-30 15:36:21",
 *     "accountNumber": "10141347",
 *     "bankName": "ACB",
 *     ...
 *   }
 * }
 */

/**
 * Verify Casso Webhook V2 signature
 * Format: X-Casso-Signature: t=timestamp,v1=signature
 * signature = HMAC-SHA512(timestamp + "." + requestBody, secretKey)
 */
async function verifyCassoSignature(
  signature: string | null,
  body: string,
  secretKey: string
): Promise<boolean> {
  if (!signature) return false;

  try {
    // Parse signature header: t=timestamp,v1=signature_hash
    const parts: Record<string, string> = {};
    signature.split(",").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) parts[key] = value;
    });

    const timestamp = parts["t"];
    const v1Signature = parts["v1"];

    if (!timestamp || !v1Signature) return false;

    // Create signed payload: timestamp.body
    const signedPayload = `${timestamp}.${body}`;

    // Calculate HMAC-SHA512
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const message = encoder.encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return calculatedSignature === v1Signature;
  } catch (error) {
    console.error("[Casso] Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Test endpoint
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Casso Webhook V2 is ready!",
        timestamp: new Date().toISOString(),
        version: "2.0",
        bankInfo: {
          bank: "ACB",
          account: "10141347",
          name: "VO LONG SANG",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

  // Main webhook handler (POST)
  if (req.method === "POST") {
    let webhookLogId: string | null = null;

    try {
      // Get raw body for signature verification
      const rawBody = await req.text();
      console.log("[Casso] Received webhook, body length:", rawBody.length);

      // Parse body early for logging
      let parsedBody: Record<string, unknown> = {};
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = { rawBody };
      }

      // Log webhook to database for debugging/retry
      const transactionData = (parsedBody.data as Record<string, unknown>) || {};
      const { data: logData } = await supabase
        .from("webhook_logs")
        .insert({
          webhook_type: "casso",
          payload: parsedBody,
          signature: req.headers.get("x-casso-signature"),
          status: "received",
          amount: (transactionData.amount as number) || 0,
          transfer_content: (transactionData.description as string) || "",
        })
        .select("id")
        .single();

      webhookLogId = logData?.id || null;
      console.log("[Casso] Webhook logged with ID:", webhookLogId);

      // Verify Casso signature (Webhook V2)
      const cassoSecret = Deno.env.get("CASSO_WEBHOOK_SECRET");
      const cassoSignature = req.headers.get("x-casso-signature");

      if (cassoSecret && cassoSignature) {
        const isValid = await verifyCassoSignature(cassoSignature, rawBody, cassoSecret);
        if (!isValid) {
          console.warn("[Casso] Invalid signature");
          // For now, log but don't reject - for debugging
          // return new Response(
          //   JSON.stringify({ error: "Invalid signature" }),
          //   { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          // );
        } else {
          console.log("[Casso] Signature verified successfully");
        }
      }

      // Parse body
      const body = JSON.parse(rawBody);
      console.log("[Casso] Parsed body:", JSON.stringify(body));

      // Validate Casso payload
      if (body.error !== 0 || !body.data) {
        console.log("[Casso] Invalid payload format");
        return new Response(JSON.stringify({ success: false, error: "Invalid payload" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Support both Webhook V1 (data is array) and V2 (data is object)
      const transaction = Array.isArray(body.data) ? body.data[0] : body.data;

      if (!transaction) {
        console.log("[Casso] No transaction data found");
        return new Response(JSON.stringify({ success: false, error: "No transaction data" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Extract transaction fields (handle both V1 and V2 field names)
      const id = transaction.id;
      const reference = transaction.reference || transaction.tid || `TX_${id}`;
      const description = transaction.description;
      const amount = transaction.amount;
      const transactionDateTime = transaction.transactionDateTime || transaction.when;
      const accountNumber = transaction.accountNumber || transaction.subAccId;

      console.log(
        `[Casso] Processing transaction: ref=${reference}, amount=${amount}, desc=${description}`
      );

      // Parse description to find booking reference
      // Expected format: "TUVAN [NAME] [DATE]" or "SUBPRO/SUBVIP [NAME] [DATE]"
      const descUpper = (description || "").toUpperCase();

      // Check if it's a subscription payment (SUBPRO, SUBVIP)
      const isSubscription = descUpper.includes("SUBPRO") || descUpper.includes("SUBVIP");
      const isConsultation = descUpper.includes("TUVAN");

      if (!isSubscription && !isConsultation) {
        console.log(`[Casso] Skipping non-recognized transaction: ${description}`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Transaction received but not recognized as consultation or subscription",
            transactionId: reference,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Handle subscription payment
      if (isSubscription) {
        return await handleSubscriptionPayment(descUpper, amount, reference, transactionDateTime);
      }

      // Find matching pending consultation
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pendingConsultations, error: queryError } = await supabase
        .from("consultations")
        .select("*")
        .eq("payment_status", "pending")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (queryError) {
        console.error("[Casso] Database query error:", queryError);
        return new Response(JSON.stringify({ success: false, error: "Database error" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      if (!pendingConsultations || pendingConsultations.length === 0) {
        console.log("[Casso] No pending consultations found");
        return new Response(
          JSON.stringify({
            success: true,
            message: "No pending consultations to match",
            transactionId: reference,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Find best match by amount and name similarity
      let bestMatch = null;
      let bestScore = 0;

      // Extract name part from description (after TUVAN)
      const tuvanIndex = descUpper.indexOf("TUVAN");
      const afterTuvan = descUpper.substring(tuvanIndex + 5).trim();

      for (const consultation of pendingConsultations) {
        let score = 0;
        let hasNameMatch = false;
        let isDiscountedPayment = false;

        // Calculate expected amount from consultation_type if payment_amount is null
        const consultationAmount =
          consultation.payment_amount || getConsultationPrice(consultation.consultation_type);

        // Check amount match (with 5% tolerance for bank fees)
        if (Math.abs(consultationAmount - amount) <= consultationAmount * 0.05) {
          score += 50;
        } else if (amount > 0 && consultationAmount > 0) {
          // Check for discounted payment (user used discount code)
          const discountRatio = amount / consultationAmount;
          if (discountRatio >= 0.05 && discountRatio <= 1.0) {
            score += 35; // Base score for discounted payment
            isDiscountedPayment = true;
          }
        }

        // Check name similarity (normalize Vietnamese diacritics)
        const clientName = removeVietnameseDiacritics(
          (consultation.client_name || "").toUpperCase().replace(/\s+/g, "")
        );
        const descNoSpace = removeVietnameseDiacritics(afterTuvan.replace(/\s+/g, ""));
        const descNamePart = descNoSpace.split(/\d/)[0]; // Get name part before any numbers

        if (descNoSpace.includes(clientName) || clientName.includes(descNamePart)) {
          score += 30;
          hasNameMatch = true;
        }

        // Check date match
        const consultationDate = new Date(consultation.consultation_date);
        const dateStr = consultationDate.toISOString().slice(0, 10).replace(/-/g, "");
        const reverseDateStr = dateStr.slice(6) + dateStr.slice(4, 6) + dateStr.slice(0, 4);
        if (afterTuvan.includes(dateStr) || afterTuvan.includes(reverseDateStr)) {
          score += 20;
        }

        // BOOST: Discounted payment with name match = high confidence
        if (isDiscountedPayment && hasNameMatch) {
          score += 15; // Boost to 35+30+15 = 80 (very high confidence)
        }

        if (score > bestScore) {
          bestScore = score;
          bestMatch = consultation;
        }
      }

      // Require minimum score of 50 (amount match alone, or discount+name match)
      if (!bestMatch || bestScore < 50) {
        console.log(`[Casso] No matching consultation found. Best score: ${bestScore}`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "No matching consultation found",
            transactionId: reference,
            searchedAmount: amount,
            pendingCount: pendingConsultations.length,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      console.log(`[Casso] Found match! Consultation ID: ${bestMatch.id}, Score: ${bestScore}`);

      // Update consultation payment status AND main status
      const { error: updateError } = await supabase
        .from("consultations")
        .update({
          status: "confirmed", // Main status - shows as "Đã xác nhận" in UI
          payment_status: "confirmed",
          payment_transaction_id: reference,
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", bestMatch.id);

      if (updateError) {
        console.error("[Casso] Failed to update consultation:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to update consultation" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      console.log(`[Casso] ✅ Payment confirmed for consultation ${bestMatch.id}`);

      // === AUTO UPGRADE SUBSCRIPTION BASED ON CONSULTATION TYPE ===
      // Business Logic (từ consultation pricing):
      // - Gói Premium (120 phút) - 999k → Tặng VIP 1 tháng
      // - Gói Tiêu Chuẩn (60 phút) - 499k → Tặng Pro 1 tháng
      // - Gói Cơ Bản (30 phút) - 299k → Tặng Pro 1 tháng
      // - Gói Miễn Phí (15 phút) - 0đ → KHÔNG có bonus
      // NOTE: Logic dựa vào consultation_type, KHÔNG phải amount user trả (vì có thể có discount code)

      let bonusPlanId: string | null = null;
      const consultationType = bestMatch.consultation_type?.toLowerCase() || "";

      // Xác định bonus plan dựa vào consultation type
      if (consultationType.includes("premium") || consultationType.includes("120")) {
        // Gói Premium (120 phút) → VIP bonus
        bonusPlanId = "vip";
      } else if (
        consultationType.includes("tiêu chuẩn") ||
        consultationType.includes("60") ||
        consultationType.includes("cơ bản") ||
        consultationType.includes("30") ||
        consultationType.includes("basic") ||
        consultationType.includes("standard")
      ) {
        // Gói Tiêu Chuẩn (60p) hoặc Gói Cơ Bản (30p) → Pro bonus
        bonusPlanId = "pro";
      }
      // Gói Miễn Phí (15 phút) hoặc không nhận dạng được → Không có bonus

      console.log(
        `[Casso] 🎁 Bonus plan: ${
          bonusPlanId || "none"
        } (consultation type: ${consultationType}, paid: ${amount})`
      );

      // Lookup user_id from client_email if not in consultation
      let userId = bestMatch.user_id;
      if (!userId && bestMatch.client_email) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", bestMatch.client_email)
          .single();

        if (!userData) {
          // Try auth.users via admin API
          const { data: authUser } = await supabase.auth.admin.listUsers();
          const matchedUser = authUser?.users?.find(
            (u) => u.email?.toLowerCase() === bestMatch.client_email?.toLowerCase()
          );
          userId = matchedUser?.id || null;
        } else {
          userId = userData.id;
        }

        if (userId) {
          console.log(`[Casso] 📧 Found user by email: ${bestMatch.client_email} → ${userId}`);
        }
      }

      if (bonusPlanId && userId) {
        try {
          const now = new Date();
          const endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1); // 1 month bonus

          // Check existing subscription - use userId variable (may be from email lookup)
          const { data: existingSub } = await supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

          if (existingSub) {
            // Upgrade if new plan is better, or extend if same/lower
            const planRank: Record<string, number> = { free: 0, pro: 1, vip: 2 };
            const currentRank = planRank[existingSub.plan_id] || 0;
            const newRank = planRank[bonusPlanId] || 0;

            if (newRank > currentRank) {
              // Upgrade to better plan
              await supabase
                .from("user_subscriptions")
                .update({
                  plan_id: bonusPlanId,
                  expires_at: endDate.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq("id", existingSub.id);
              console.log(
                `[Casso] 🎁 Upgraded user to ${bonusPlanId.toUpperCase()} (consultation bonus)`
              );
            } else {
              // Extend current subscription by 1 month
              const currentEnd = new Date(existingSub.expires_at);
              currentEnd.setMonth(currentEnd.getMonth() + 1);
              await supabase
                .from("user_subscriptions")
                .update({
                  expires_at: currentEnd.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq("id", existingSub.id);
              console.log(`[Casso] 🎁 Extended subscription by 1 month (consultation bonus)`);
            }
          } else {
            // Create new subscription
            await supabase.from("user_subscriptions").insert({
              user_id: userId,
              plan_id: bonusPlanId,
              status: "active",
              starts_at: now.toISOString(),
              expires_at: endDate.toISOString(),
              payment_status: "confirmed",
              payment_amount: 0,
              payment_transaction_id: `BONUS_${bestMatch.id}`,
              payment_confirmed_at: now.toISOString(),
              auto_renew: false,
              user_email: bestMatch.client_email,
              user_name: bestMatch.client_name,
              billing_cycle: "monthly",
            });
            console.log(
              `[Casso] 🎁 Created ${bonusPlanId.toUpperCase()} subscription (consultation bonus)`
            );
          }
        } catch (subError) {
          console.error("[Casso] Failed to create bonus subscription:", subError);
          // Don't fail the whole request, subscription is a bonus
        }
      }

      // Send confirmation emails
      try {
        // Email to client with bonus info
        await resend.emails.send({
          from: "Long Sang <noreply@longsang.org>",
          to: bestMatch.client_email,
          subject: bonusPlanId
            ? `✅ Thanh toán thành công + 🎁 Tặng gói ${bonusPlanId.toUpperCase()} 1 tháng!`
            : "✅ Xác nhận thanh toán - Lịch tư vấn của bạn đã được đặt thành công!",
          html: getClientConfirmationEmail(bestMatch, amount, reference, bonusPlanId),
        });

        // Email to admin
        await resend.emails.send({
          from: "Long Sang System <noreply@longsang.org>",
          to: ADMIN_EMAIL,
          subject: `💰 Thanh toán xác nhận: ${bestMatch.client_name} - ${formatCurrency(amount)}`,
          html: getAdminConfirmationEmail(bestMatch, amount, reference),
        });

        console.log("[Casso] Confirmation emails sent");
      } catch (emailError) {
        console.error("[Casso] Failed to send emails:", emailError);
      }

      // === CREATE GOOGLE CALENDAR EVENT WITH GOOGLE MEET ===
      try {
        console.log(
          `[Casso] Creating calendar event for consultation:`,
          JSON.stringify({
            id: bestMatch.id,
            client_name: bestMatch.client_name,
            client_email: bestMatch.client_email,
            consultation_date: bestMatch.consultation_date,
            start_time: bestMatch.start_time,
            consultation_type: bestMatch.consultation_type,
          })
        );

        const calendarResult = await createGoogleCalendarEvent(bestMatch);
        console.log(`[Casso] Calendar function returned:`, JSON.stringify(calendarResult));

        if (calendarResult) {
          const updateData: Record<string, unknown> = {
            calendar_event_id: calendarResult.eventId,
          };

          // Save Google Meet link if available
          if (calendarResult.meetLink) {
            updateData.meeting_link = calendarResult.meetLink;
            console.log(`[Casso] 🎥 Google Meet link: ${calendarResult.meetLink}`);
          }

          const { error: updateError } = await supabase
            .from("consultations")
            .update(updateData)
            .eq("id", bestMatch.id);

          if (updateError) {
            console.error(`[Casso] Failed to update calendar_event_id:`, updateError);
          } else {
            console.log(`[Casso] 📅 Calendar event created: ${calendarResult.eventId}`);
          }
        } else {
          console.log(`[Casso] Calendar event was not created (returned null)`);
        }
      } catch (calendarError) {
        console.error("[Casso] Failed to create calendar event:", calendarError);
        // Don't fail the whole request
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Payment confirmed",
          consultationId: bestMatch.id,
          clientName: bestMatch.client_name,
          amount,
          transactionId: reference,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (error) {
      console.error("[Casso] Webhook error:", error);

      // Update webhook log with error
      if (webhookLogId) {
        await supabase
          .from("webhook_logs")
          .update({
            status: "failed",
            error_message: String(error),
            retry_count: 0,
            next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
          })
          .eq("id", webhookLogId);
      }

      return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 405,
  });
});

// Helper to update webhook log status
async function updateWebhookLog(
  logId: string | null,
  status: string,
  matchedUserId?: string,
  matchedSubscriptionId?: string
) {
  if (!logId) return;

  await supabase
    .from("webhook_logs")
    .update({
      status,
      matched_user_id: matchedUserId,
      matched_subscription_id: matchedSubscriptionId,
      processed_at: new Date().toISOString(),
    })
    .eq("id", logId);
}

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Email templates
function getClientConfirmationEmail(
  consultation: any,
  amount: number,
  ref: string,
  bonusPlan?: string | null
): string {
  const bonusSection = bonusPlan
    ? `
        <div style="background: linear-gradient(135deg, ${
          bonusPlan === "vip" ? "#fef3c7" : "#dbeafe"
        }  0%, ${bonusPlan === "vip" ? "#fde68a" : "#bfdbfe"} 100%); border: 2px solid ${
        bonusPlan === "vip" ? "#f59e0b" : "#3b82f6"
      }; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0 0 8px 0; color: ${
            bonusPlan === "vip" ? "#b45309" : "#1d4ed8"
          };">🎁 QUÀ TẶNG ĐẶC BIỆT!</h3>
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${
            bonusPlan === "vip" ? "#b45309" : "#1d4ed8"
          };">
            ${bonusPlan === "vip" ? "👑" : "⚡"} Gói ${bonusPlan.toUpperCase()} miễn phí 1 tháng
          </p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">
            Cảm ơn bạn đã tin tưởng! Tài khoản của bạn đã được nâng cấp.
          </p>
        </div>
  `
    : "";

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">✅ Thanh Toán Thành Công!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Lịch tư vấn của bạn đã được xác nhận</p>
      </div>

      <div style="padding: 32px 24px;">
        <p>Xin chào <strong>${consultation.client_name}</strong>,</p>
        <p>Chúng tôi đã nhận được thanh toán của bạn. Lịch tư vấn đã được xác nhận!</p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0; color: #16a34a;">📅 Chi tiết lịch hẹn</h3>
          <p style="margin: 8px 0;"><strong>Ngày:</strong> ${formatDate(
            consultation.consultation_date
          )}</p>
          <p style="margin: 8px 0;"><strong>Giờ:</strong> ${consultation.time_slot}</p>
          <p style="margin: 8px 0;"><strong>Gói:</strong> ${consultation.consultation_type}</p>
          <p style="margin: 8px 0;"><strong>Số tiền:</strong> ${formatCurrency(amount)}</p>
          <p style="margin: 8px 0; font-size: 12px; color: #6b7280;"><strong>Mã GD:</strong> ${ref}</p>
        </div>

        ${bonusSection}

        <p>Tôi sẽ liên hệ với bạn trước buổi tư vấn để xác nhận thêm chi tiết.</p>

        <p style="margin-top: 24px;">Trân trọng,<br><strong>Võ Long Sang</strong></p>
      </div>

      <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 Long Sang. All rights reserved.</p>
      </div>
    </div>
  `;
}

function getAdminConfirmationEmail(consultation: any, amount: number, ref: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💰 Thanh Toán Đã Xác Nhận</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Hệ thống Casso tự động xác nhận</p>
      </div>

      <div style="padding: 32px 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0; color: #16a34a;">Thông tin giao dịch</h3>
          <p style="margin: 8px 0;"><strong>Khách hàng:</strong> ${consultation.client_name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${consultation.client_email}</p>
          <p style="margin: 8px 0;"><strong>Số tiền:</strong> ${formatCurrency(amount)}</p>
          <p style="margin: 8px 0;"><strong>Mã GD:</strong> ${ref}</p>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0;">📅 Chi tiết lịch hẹn</h3>
          <p style="margin: 8px 0;"><strong>Ngày:</strong> ${formatDate(
            consultation.consultation_date
          )}</p>
          <p style="margin: 8px 0;"><strong>Giờ:</strong> ${consultation.time_slot}</p>
          <p style="margin: 8px 0;"><strong>Gói:</strong> ${consultation.consultation_type}</p>
          ${
            consultation.notes
              ? `<p style="margin: 8px 0;"><strong>Ghi chú:</strong> ${consultation.notes}</p>`
              : ""
          }
        </div>

        <p style="color: #6b7280; font-size: 12px;">Thời gian xác nhận: ${new Date().toLocaleString(
          "vi-VN"
        )}</p>
      </div>
    </div>
  `;
}

// ============= SUBSCRIPTION PAYMENT HANDLER =============

/**
 * Process a matched subscription - confirm payment, send emails
 */
async function processSubscriptionMatch(
  subscription: any,
  amount: number,
  reference: string,
  descUpper: string,
  isYearly: boolean
): Promise<Response> {
  console.log(`[Casso] Processing subscription match: ${subscription.id}, amount: ${amount}`);

  // Calculate expires_at based on billing cycle
  const now = new Date();
  const durationDays = isYearly ? 365 : 30;
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Update subscription status
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({
      status: "active",
      payment_status: "confirmed",
      payment_transaction_id: reference,
      payment_confirmed_at: new Date().toISOString(),
      billing_cycle: isYearly ? "yearly" : "monthly",
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", subscription.id);

  if (updateError) {
    console.error("[Casso] Failed to update subscription:", updateError);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to update subscription" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }

  console.log(
    `[Casso] ✅ Subscription ${subscription.id} activated! Duration: ${durationDays} days`
  );

  // Send confirmation emails
  const planId = subscription.plan_id;
  const userEmail = subscription.user_email;
  const userName = subscription.user_name || userEmail?.split("@")[0] || "Bạn";
  const durationText = isYearly ? "1 năm (365 ngày)" : "1 tháng (30 ngày)";

  try {
    if (userEmail) {
      await resend.emails.send({
        from: "Long Sang <noreply@longsang.org>",
        to: userEmail,
        subject: `✅ Kích hoạt thành công gói ${planId.toUpperCase()} ${
          isYearly ? "(1 năm)" : ""
        } - Long Sang`,
        html: getSubscriptionConfirmationEmail(userName, planId, amount, reference, durationText),
      });
    }

    await resend.emails.send({
      from: "Long Sang System <noreply@longsang.org>",
      to: ADMIN_EMAIL,
      subject: `💎 Subscription mới: ${userName} - Gói ${planId.toUpperCase()} ${
        isYearly ? "(YEARLY)" : ""
      } - ${formatCurrency(amount)}`,
      html: getAdminSubscriptionEmail(userName, userEmail, planId, amount, reference, durationText),
    });

    console.log("[Casso] Subscription confirmation emails sent");
  } catch (emailError) {
    console.error("[Casso] Failed to send subscription emails:", emailError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: "Subscription activated",
      subscriptionId: subscription.id,
      planId,
      billingCycle: isYearly ? "yearly" : "monthly",
      durationDays,
      amount,
      transactionId: reference,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    }
  );
}

async function handleSubscriptionPayment(
  descUpper: string,
  amount: number,
  reference: string,
  transactionDateTime: string
): Promise<Response> {
  console.log(`[Casso] Processing subscription payment: ${descUpper}, amount: ${amount}`);

  // Check if yearly subscription (ends with Y before date or after user name)
  const isYearly = descUpper.includes("Y ") || descUpper.endsWith("Y");

  // Determine plan type from description
  let planId = "";

  if (descUpper.includes("SUBVIP")) {
    planId = "vip";
  } else if (descUpper.includes("SUBPRO")) {
    planId = "pro";
  }

  // Find pending subscription - match by plan_id first
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: pendingSubscriptions, error: queryError } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("plan_id", planId)
    .eq("payment_status", "pending")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (queryError) {
    console.error("[Casso] Subscription query error:", queryError);
    return new Response(JSON.stringify({ success: false, error: "Database error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!pendingSubscriptions || pendingSubscriptions.length === 0) {
    console.log(`[Casso] No pending ${planId} subscriptions found, will retry...`);

    // RETRY LOGIC: Webhook often arrives BEFORE subscription is created
    // Wait and retry up to 3 times with 5 second delays
    for (let retry = 1; retry <= 3; retry++) {
      console.log(`[Casso] Retry ${retry}/3 - waiting 5 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const { data: retrySubscriptions } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("plan_id", planId)
        .eq("payment_status", "pending")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (retrySubscriptions && retrySubscriptions.length > 0) {
        // Found subscriptions on retry, find matching one
        const amountMatch = retrySubscriptions.find(
          (s) => Math.abs(amount - (s.payment_amount || 0)) <= 1000
        );

        if (amountMatch) {
          console.log(`[Casso] ✅ Found match on retry ${retry}!`);
          // Continue processing with this match
          return await processSubscriptionMatch(amountMatch, amount, reference, descUpper, true);
        }
      }
    }

    console.log(`[Casso] No pending ${planId} subscriptions found after 3 retries`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "No pending subscriptions to match after retries",
        transactionId: reference,
        planId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  }

  // Find best match by payment_amount (supports discount codes) and name similarity
  let bestMatch: any = null;
  let bestScore = 0;

  // Extract name from description (after SUBPRO/SUBVIP)
  const subIndex = descUpper.indexOf("SUB");
  const afterSub = descUpper.substring(subIndex + 6).trim(); // Skip "SUBPRO" or "SUBVIP"

  for (const subscription of pendingSubscriptions) {
    let score = 0;

    // Check payment_amount match (most important - supports discount codes)
    const expectedAmount = subscription.payment_amount || 0;
    const tolerance = 1000; // 1000 VND tolerance
    if (Math.abs(amount - expectedAmount) <= tolerance) {
      score += 100; // High score for exact amount match
      console.log(`[Casso] Amount match: ${amount} ≈ ${expectedAmount} (stored in DB)`);
    } else {
      console.log(`[Casso] Amount mismatch: got ${amount}, expected ${expectedAmount}`);
    }

    // Check name similarity from stored user_name
    const userName = (subscription.user_name || subscription.user_email?.split("@")[0] || "")
      .toUpperCase()
      .replace(/\s+/g, "");

    const descNoSpace = afterSub.replace(/\s+/g, "");
    if (descNoSpace.includes(userName) || userName.includes(descNoSpace.split(/\d/)[0])) {
      score += 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = subscription;
    }
  }

  // If no amount match, try to find any pending subscription (FIFO fallback)
  if (!bestMatch || bestScore < 100) {
    // Check if amount matches any pending subscription's payment_amount
    const amountMatch = pendingSubscriptions.find(
      (s) => Math.abs(amount - (s.payment_amount || 0)) <= 1000
    );
    if (amountMatch) {
      bestMatch = amountMatch;
      bestScore = 100;
    } else {
      console.log(`[Casso] No matching payment_amount found for ${amount}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Amount does not match any pending subscription",
          transactionId: reference,
          gotAmount: amount,
          pendingAmounts: pendingSubscriptions.map((s) => s.payment_amount),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  }

  console.log(
    `[Casso] Found subscription match! ID: ${bestMatch.id}, Score: ${bestScore}, Yearly: ${isYearly}`
  );

  // Use helper function to process the match
  return await processSubscriptionMatch(bestMatch, amount, reference, descUpper, isYearly);
}

// Subscription email templates
function getSubscriptionConfirmationEmail(
  userName: string,
  planId: string,
  amount: number,
  ref: string,
  durationText: string = "1 tháng (30 ngày)"
): string {
  const planNames: Record<string, string> = { pro: "Pro", vip: "VIP" };
  const planEmoji: Record<string, string> = { pro: "⚡", vip: "👑" };

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, ${
        planId === "vip" ? "#f59e0b, #ea580c" : "#3b82f6, #06b6d4"
      }); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${
          planEmoji[planId]
        } Chào mừng đến với ${planNames[planId]}!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Gói đăng ký của bạn đã được kích hoạt</p>
      </div>

      <div style="padding: 32px 24px;">
        <p>Xin chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký gói <strong>${
          planNames[planId]
        }</strong>! Tài khoản của bạn đã được nâng cấp với các quyền lợi sau:</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          ${
            planId === "vip"
              ? `
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>📡 Cập nhật AI real-time + Early access</li>
              <li>🚀 Thông báo sản phẩm mới sớm 7 ngày + Beta access</li>
              <li>🎨 Xem tất cả Showcase premium + Source hints</li>
              <li>🗺️ Roadmap chiến lược + Behind the scenes</li>
              <li>💬 Nhóm riêng + Chat trực tiếp với founder</li>
              <li>💎 Ưu tiên đầu tư + Điều khoản tốt hơn</li>
              <li>🛟 Hỗ trợ ưu tiên (24h)</li>
              <li>🎁 Giảm 20% phí tư vấn</li>
            </ul>
          `
              : `
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>📡 Cập nhật AI hàng tuần</li>
              <li>🚀 Thông báo sản phẩm mới sớm 3 ngày</li>
              <li>🎨 Xem 10+ Showcase tiêu chuẩn</li>
              <li>🗺️ Truy cập đầy đủ Roadmap</li>
              <li>💬 Kênh Discord Pro</li>
              <li>🛟 Hỗ trợ email (48h)</li>
              <li>🎁 Giảm 10% phí tư vấn</li>
            </ul>
          `
          }
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #16a34a;">
            <strong>Chi tiết thanh toán:</strong><br>
            Số tiền: ${formatCurrency(amount)}<br>
            Mã GD: ${ref}<br>
            Thời hạn: ${durationText}
          </p>
        </div>

        <p>Bắt đầu khám phá các tính năng mới ngay!</p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://longsang.org/dashboard" style="display: inline-block; background: linear-gradient(135deg, ${
            planId === "vip" ? "#f59e0b, #ea580c" : "#3b82f6, #06b6d4"
          }); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Vào Dashboard →
          </a>
        </div>

        <p style="margin-top: 24px;">Trân trọng,<br><strong>Võ Long Sang</strong></p>
      </div>

      <div style="background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; margin: 0;">© 2025 Long Sang. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Get consultation price based on type
 */
function getConsultationPrice(consultationType: string): number {
  const typeLower = (consultationType || "").toLowerCase();
  if (typeLower.includes("premium") || typeLower.includes("120")) return 999000;
  if (typeLower.includes("tiêu chuẩn") || typeLower.includes("60")) return 499000;
  if (typeLower.includes("cơ bản") || typeLower.includes("30")) return 299000;
  if (typeLower.includes("miễn phí") || typeLower.includes("free") || typeLower.includes("15"))
    return 0;
  return 299000; // default to basic
}

function getAdminSubscriptionEmail(
  userName: string,
  email: string,
  planId: string,
  amount: number,
  ref: string,
  durationText: string = "1 tháng (30 ngày)"
): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #8b5cf6, #a855f7); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💎 Subscription Mới!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Có người vừa đăng ký gói ${planId.toUpperCase()}</p>
      </div>

      <div style="padding: 32px 24px;">
        <div style="background: #faf5ff; border: 1px solid #e9d5ff; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin: 0 0 16px 0; color: #7c3aed;">Thông tin người dùng</h3>
          <p style="margin: 8px 0;"><strong>Tên:</strong> ${userName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>Gói:</strong> ${planId.toUpperCase()}</p>
          <p style="margin: 8px 0;"><strong>Thời hạn:</strong> ${durationText}</p>
          <p style="margin: 8px 0;"><strong>Số tiền:</strong> ${formatCurrency(amount)}</p>
          <p style="margin: 8px 0;"><strong>Mã GD:</strong> ${ref}</p>
        </div>

        <p style="color: #6b7280; font-size: 12px;">Thời gian: ${new Date().toLocaleString(
          "vi-VN"
        )}</p>
      </div>
    </div>
  `;
}

// ============= GOOGLE CALENDAR INTEGRATION =============

interface ConsultationData {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  consultation_date: string;
  start_time: string;
  end_time?: string;
  consultation_type: string;
  notes?: string;
}

/**
 * Get duration in minutes from consultation type
 */
function getDurationFromType(consultationType: string): number {
  const typeLower = consultationType.toLowerCase();
  if (typeLower.includes("premium") || typeLower.includes("120")) return 120;
  if (typeLower.includes("tiêu chuẩn") || typeLower.includes("60")) return 60;
  if (typeLower.includes("cơ bản") || typeLower.includes("30")) return 30;
  if (typeLower.includes("miễn phí") || typeLower.includes("15")) return 15;
  return 60; // default
}

interface CalendarResult {
  eventId: string;
  meetLink?: string;
}

/**
 * Create Google Calendar event for confirmed consultation
 * Uses Google Service Account for authentication
 * Returns event ID and Google Meet link
 */
async function createGoogleCalendarEvent(
  consultation: ConsultationData
): Promise<CalendarResult | null> {
  console.log("[Calendar] Starting createGoogleCalendarEvent");

  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  const calendarEmail = Deno.env.get("GOOGLE_CALENDAR_EMAIL") || "longsangsabo@gmail.com";

  console.log(
    `[Calendar] Has service account: ${!!serviceAccountJson}, Calendar: ${calendarEmail}`
  );

  if (!serviceAccountJson) {
    console.log("[Casso] Google Service Account not configured, skipping calendar");
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Create JWT for Google API authentication
    const now = Math.floor(Date.now() / 1000);
    const jwtHeader = { alg: "RS256", typ: "JWT" };
    const jwtPayload = {
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/calendar",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    // Base64url encode
    const base64urlEncode = (obj: unknown) => {
      const str = JSON.stringify(obj);
      const bytes = new TextEncoder().encode(str);
      return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const unsignedToken = `${base64urlEncode(jwtHeader)}.${base64urlEncode(jwtPayload)}`;

    // Sign with RS256
    const privateKeyPem = serviceAccount.private_key;
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = privateKeyPem
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\n/g, "");
    const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const signedJwt = `${unsignedToken}.${signatureBase64}`;

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: signedJwt,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("[Casso] Failed to get Google token:", error);
      return null;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Calculate times
    const durationMinutes = getDurationFromType(consultation.consultation_type);
    const startTimeParts = consultation.start_time.split(":");
    const startHour = parseInt(startTimeParts[0]);
    const startMin = parseInt(startTimeParts[1]);
    const endMinutes = startHour * 60 + startMin + durationMinutes;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const startTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(
      2,
      "0"
    )}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}:00`;

    // Create calendar event
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
        dateTime: `${consultation.consultation_date}T${startTime}`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: `${consultation.consultation_date}T${endTime}`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      // Note: attendees removed - Service Account cannot send invites to external emails
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
      // Note: Google Meet (conferenceData) removed - Service Account doesn't have Google Workspace license
      // If you need Meet links, setup Domain-Wide Delegation or use Zoom
    };

    // Create calendar event without conferenceData
    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarEmail
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error("[Casso] Failed to create calendar event:", error);
      return null;
    }

    const calendarData = await calendarResponse.json();

    // Extract Google Meet link
    const meetLink = calendarData.conferenceData?.entryPoints?.find(
      (ep: { entryPointType: string }) => ep.entryPointType === "video"
    )?.uri;

    if (meetLink) {
      console.log(`[Casso] 🎥 Google Meet link created: ${meetLink}`);
    }

    return { eventId: calendarData.id, meetLink };
  } catch (error) {
    console.error("[Casso] Calendar error:", error);
    return null;
  }
}
