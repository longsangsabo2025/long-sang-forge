/**
 * Credentials Helper Edge Function
 * For encryption/decryption utilities
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get encryption key
function getEncryptionKey(): Uint8Array {
  const envKey = Deno.env.get("ENCRYPTION_KEY") || "dev-encryption-key-change-in-production";
  const encoder = new TextEncoder();
  const keyData = encoder.encode(envKey);

  // Create a 32-byte key using a simple hash
  const key = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    key[i] = keyData[i % keyData.length];
  }
  return key;
}

/**
 * Encrypt data using AES-GCM
 */
async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const key = getEncryptionKey();

  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-GCM" }, false, [
    "encrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, data);

  // Combine iv + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to hex
  return Array.from(combined)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Decrypt data using AES-GCM
 */
async function decrypt(encryptedHex: string): Promise<string | null> {
  try {
    // Convert hex to bytes
    const combined = new Uint8Array(encryptedHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));

    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const key = getEncryptionKey();
    const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "AES-GCM" }, false, [
      "decrypt",
    ]);

    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, encrypted);

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // POST /credentials/encrypt
    if (req.method === "POST" && path === "encrypt") {
      const { data } = await req.json();

      if (!data) {
        return new Response(JSON.stringify({ error: "Data is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const encrypted = await encrypt(data);
      return new Response(JSON.stringify({ success: true, encrypted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /credentials/decrypt
    if (req.method === "POST" && path === "decrypt") {
      const { encrypted } = await req.json();

      if (!encrypted) {
        return new Response(JSON.stringify({ error: "Encrypted data is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const decrypted = await decrypt(encrypted);

      if (decrypted === null) {
        return new Response(JSON.stringify({ error: "Failed to decrypt data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, decrypted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /credentials/status - Check service status
    if (req.method === "GET" && (path === "status" || path === "test")) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Credentials Edge Function is ready!",
          timestamp: new Date().toISOString(),
          hasEncryptionKey: !!Deno.env.get("ENCRYPTION_KEY"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Credentials error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
