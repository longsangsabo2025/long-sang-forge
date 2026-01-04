import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Get Google Calendar access token using service account
 */
async function getAccessToken(): Promise<string | null> {
  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
    return null;
  }

  const serviceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const jwtHeader = { alg: "RS256", typ: "JWT" };
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const base64urlEncode = (obj: unknown) => {
    const str = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(str);
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const unsignedToken = `${base64urlEncode(jwtHeader)}.${base64urlEncode(jwtPayload)}`;

  const privateKeyPem = serviceAccount.private_key;
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
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

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${signatureB64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    console.error("Token exchange failed:", await tokenResponse.text());
    return null;
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

/**
 * List all events from calendar
 */
async function listEvents(accessToken: string, calendarEmail: string, timeMin?: string, timeMax?: string) {
  const params = new URLSearchParams({
    maxResults: "250",
    singleEvents: "true",
    orderBy: "startTime",
  });

  if (timeMin) params.set("timeMin", timeMin);
  if (timeMax) params.set("timeMax", timeMax);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarEmail)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    console.error("Failed to list events:", await response.text());
    return [];
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Delete a single event
 */
async function deleteEvent(accessToken: string, calendarEmail: string, eventId: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarEmail)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.ok || response.status === 410; // 410 = already deleted
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, timeMin, timeMax, searchQuery } = await req.json();
    const calendarEmail = Deno.env.get("GOOGLE_CALENDAR_EMAIL") || "longsangsabo@gmail.com";

    console.log(`[Clear Calendar] Action: ${action}, Calendar: ${calendarEmail}`);

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Failed to get access token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list") {
      // List events (for preview)
      const events = await listEvents(accessToken, calendarEmail, timeMin, timeMax);
      
      // Filter by search query if provided
      let filteredEvents = events;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEvents = events.filter((e: any) => 
          e.summary?.toLowerCase().includes(query) || 
          e.description?.toLowerCase().includes(query)
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: filteredEvents.length,
          events: filteredEvents.map((e: any) => ({
            id: e.id,
            summary: e.summary,
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "clear") {
      // Get events to delete
      let events = await listEvents(accessToken, calendarEmail, timeMin, timeMax);
      
      // Filter by search query if provided (e.g., "Tư vấn" for consultation events)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        events = events.filter((e: any) => 
          e.summary?.toLowerCase().includes(query) || 
          e.description?.toLowerCase().includes(query)
        );
      }

      console.log(`[Clear Calendar] Deleting ${events.length} events...`);

      let deleted = 0;
      let failed = 0;

      for (const event of events) {
        const success = await deleteEvent(accessToken, calendarEmail, event.id);
        if (success) {
          deleted++;
          console.log(`[Clear Calendar] Deleted: ${event.summary}`);
        } else {
          failed++;
          console.error(`[Clear Calendar] Failed to delete: ${event.summary}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Deleted ${deleted} events, ${failed} failed`,
          deleted,
          failed,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list' or 'clear'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Clear Calendar] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
