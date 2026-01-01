import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CalendarResult {
  eventId: string;
  meetLink?: string;
}

interface ConsultationData {
  id: string;
  client_name: string;
  client_email: string;
  consultation_date: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  consultation_type: string;
  notes?: string;
}

interface CalendarError {
  error: string;
  step: string;
}

/**
 * Create Google Calendar event with Google Meet
 */
async function createGoogleCalendarEvent(
  consultation: ConsultationData
): Promise<CalendarResult | CalendarError> {
  console.log("[Calendar] Starting createGoogleCalendarEvent");

  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  const calendarEmail = Deno.env.get("GOOGLE_CALENDAR_EMAIL") || "longsangsabo@gmail.com";

  console.log(
    `[Calendar] Has service account: ${!!serviceAccountJson}, Calendar: ${calendarEmail}`
  );
  console.log(`[Calendar] Service account length: ${serviceAccountJson?.length || 0}`);

  if (!serviceAccountJson) {
    return { error: "GOOGLE_SERVICE_ACCOUNT_JSON not set", step: "init" };
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
    console.log(`[Calendar] Service account email: ${serviceAccount.client_email}`);
  } catch (e) {
    return { error: `JSON parse failed: ${e}`, step: "parse_json" };
  }

  try {
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
    if (!privateKeyPem) {
      return { error: "private_key not found in service account", step: "get_key" };
    }

    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = privateKeyPem
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\n/g, "");

    let binaryKey;
    try {
      binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
    } catch (e) {
      return { error: `Failed to decode private key: ${e}`, step: "decode_key" };
    }

    let cryptoKey;
    try {
      cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
      );
    } catch (e) {
      return { error: `Failed to import key: ${e}`, step: "import_key" };
    }

    console.log("[Calendar] Key imported successfully");

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const jwt = `${unsignedToken}.${signatureB64}`;
    console.log("[Calendar] JWT created successfully");

    // Exchange JWT for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error("[Calendar] Token error:", tokenError);
      return { error: `Token exchange failed: ${tokenError}`, step: "token" };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("[Calendar] Access token obtained");

    // Create calendar event with Google Meet
    console.log("[Calendar] Raw start_time:", consultation.start_time);
    console.log("[Calendar] consultation_date:", consultation.consultation_date);

    // Handle missing start_time
    if (!consultation.start_time) {
      return { error: "start_time is missing", step: "validate" };
    }

    const startTime = consultation.start_time.slice(0, 5);
    const endMinutes = consultation.duration_minutes || 30;
    const [startHour, startMin] = startTime.split(":").map(Number);
    const totalMinutes = startHour * 60 + startMin + endMinutes;
    const endHour = Math.floor(totalMinutes / 60);
    const endMin = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    const event = {
      summary: `Tư vấn: ${consultation.client_name}`,
      description: `Email: ${consultation.client_email}
Loại: ${consultation.consultation_type}
Ghi chú: ${consultation.notes || "Không có"}`,
      start: {
        dateTime: `${consultation.consultation_date}T${startTime}:00`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      end: {
        dateTime: `${consultation.consultation_date}T${endTime}:00`,
        timeZone: "Asia/Ho_Chi_Minh",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 30 },
        ],
      },
    };

    // First try to create event with conferenceData on service account's primary calendar
    // This should work for Google Meet
    const eventWithMeet = {
      ...event,
      conferenceData: {
        createRequest: {
          requestId: `consultation-${consultation.id}-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    console.log("[Calendar] Trying to create event with Meet on service account calendar...");

    // Use service account's primary calendar first
    let calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventWithMeet),
      }
    );

    let responseText = await calendarResponse.text();
    console.log("[Calendar] Service account calendar response:", calendarResponse.status);

    if (calendarResponse.ok) {
      // Also add event to shared calendar
      console.log("[Calendar] Adding to shared calendar:", calendarEmail);
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendarEmail
        )}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event), // Without conferenceData
        }
      );
    } else {
      // Fallback: try shared calendar without Meet
      console.log("[Calendar] Fallback to shared calendar without Meet...");
      calendarResponse = await fetch(
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
      responseText = await calendarResponse.text();
    }
    console.log("[Calendar] Response status:", calendarResponse.status);
    console.log("[Calendar] Response:", responseText);

    if (!calendarResponse.ok) {
      console.error("[Calendar] Failed to create event:", responseText);
      return { error: `Calendar API failed: ${responseText}`, step: "create_event" };
    }

    const calendarData = JSON.parse(responseText);

    // Extract Google Meet link
    const meetLink = calendarData.conferenceData?.entryPoints?.find(
      (ep: { entryPointType: string }) => ep.entryPointType === "video"
    )?.uri;

    console.log(`[Calendar] Event ID: ${calendarData.id}`);
    console.log(`[Calendar] Meet link: ${meetLink}`);

    return { eventId: calendarData.id, meetLink };
  } catch (error) {
    console.error("[Calendar] Error:", error);
    return { error: `Exception: ${error}`, step: "exception" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log("[Debug] Starting...");

    // Parse request body for consultation ID
    const body = await req.json().catch(() => ({}));
    const consultationId = body.consultationId;

    if (!consultationId) {
      return new Response(JSON.stringify({ error: "consultationId required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    log(`[Debug] Consultation ID: ${consultationId}`);

    // Check environment variables
    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const calendarEmail = Deno.env.get("GOOGLE_CALENDAR_EMAIL") || "longsangsabo@gmail.com";

    log(`[Debug] Has GOOGLE_SERVICE_ACCOUNT_JSON: ${!!serviceAccountJson}`);
    log(`[Debug] GOOGLE_CALENDAR_EMAIL: ${calendarEmail}`);

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GOOGLE_SERVICE_ACCOUNT_JSON not configured",
          logs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    log(`[Debug] Service account JSON length: ${serviceAccountJson.length}`);

    // Parse service account
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      log(`[Debug] Service account email: ${serviceAccount.client_email}`);
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to parse service account JSON: ${e}`,
          logs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Fetch consultation from database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: consultation, error: dbError } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", consultationId)
      .single();

    if (dbError || !consultation) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Consultation not found: ${dbError?.message}`,
          logs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    log(`[Debug] Consultation found: ${consultation.client_name}`);
    log(`[Debug] Date: ${consultation.consultation_date}, Time: ${consultation.start_time}`);

    // Create calendar event
    const result = await createGoogleCalendarEvent(consultation);

    log(`[Debug] Calendar result: ${JSON.stringify(result)}`);

    // Check for error in result
    if (result && "error" in result) {
      return new Response(
        JSON.stringify({
          success: false,
          error: (result as unknown as { error: string }).error,
          logs,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (result && result.eventId) {
      // Update database
      await supabase
        .from("consultations")
        .update({
          calendar_event_id: result.eventId,
          meeting_link: result.meetLink,
        })
        .eq("id", consultationId);

      return new Response(
        JSON.stringify({
          success: true,
          eventId: result.eventId,
          meetLink: result.meetLink,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create calendar event",
          logs,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("[Debug] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
