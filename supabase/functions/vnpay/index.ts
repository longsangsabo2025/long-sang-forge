import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// VNPay Configuration
const vnpayConfig = {
  vnp_TmnCode: Deno.env.get("VNPAY_TMN_CODE") || "YOUR_TMN_CODE",
  vnp_HashSecret: Deno.env.get("VNPAY_HASH_SECRET") || "YOUR_HASH_SECRET",
  vnp_Url: Deno.env.get("VNPAY_URL") || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: `${Deno.env.get("APP_URL") || "https://longsang.org"}/payment-vnpay-return`,
};

/**
 * Sort object keys alphabetically
 */
function sortObject(obj: Record<string, any>): Record<string, any> {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

/**
 * Create HMAC SHA512 signature
 */
async function createSignature(data: string, secretKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const message = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, message);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Build query string
 */
function buildQueryString(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

/**
 * Parse query string
 */
function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  queryString.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key) params[key] = decodeURIComponent(value || "");
  });
  return params;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // POST /vnpay/create-payment-url
    if (req.method === "POST" && path === "create-payment-url") {
      const { planId, userId, amount, orderInfo } = await req.json();

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        return new Response(JSON.stringify({ error: "Plan not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate unique transaction reference
      const date = new Date();
      const createDate = date
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14);
      const orderId = `${userId}_${planId}_${Date.now()}`;

      // Calculate amount in VND
      const amountVND = Math.round((amount || plan.price_monthly) * 25000);

      // Build VNPay parameters
      let vnpParams: Record<string, any> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Amount: amountVND * 100,
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo || `Thanh toan goi ${plan.display_name}`,
        vnp_OrderType: "other",
        vnp_Locale: "vn",
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_IpAddr: "127.0.0.1",
        vnp_CreateDate: createDate,
      };

      // Sort and sign
      vnpParams = sortObject(vnpParams);
      const signData = buildQueryString(vnpParams);
      const signature = await createSignature(signData, vnpayConfig.vnp_HashSecret);
      vnpParams.vnp_SecureHash = signature;

      // Build payment URL
      const paymentUrl = vnpayConfig.vnp_Url + "?" + buildQueryString(vnpParams);

      // Store pending transaction
      await supabase.from("payment_history").insert({
        user_id: userId,
        plan_id: planId,
        amount: amountVND / 100,
        currency: "VND",
        status: "pending",
        payment_method: "vnpay",
        transaction_id: orderId,
        metadata: JSON.stringify({ vnp_TxnRef: orderId }),
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ success: true, paymentUrl, orderId, amount: amountVND }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /vnpay/return - Handle return from VNPay
    if (req.method === "GET" && path === "return") {
      const vnpParams = Object.fromEntries(url.searchParams);
      const secureHash = vnpParams.vnp_SecureHash;

      delete vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHashType;

      const sortedParams = sortObject(vnpParams);
      const signData = buildQueryString(sortedParams);
      const checkSum = await createSignature(signData, vnpayConfig.vnp_HashSecret);

      if (secureHash === checkSum) {
        const responseCode = vnpParams.vnp_ResponseCode;
        const orderId = vnpParams.vnp_TxnRef;

        if (responseCode === "00") {
          // Payment successful
          await supabase
            .from("payment_history")
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq("transaction_id", orderId);

          return new Response(
            JSON.stringify({ success: true, message: "Payment successful", orderId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          // Payment failed
          await supabase
            .from("payment_history")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("transaction_id", orderId);

          return new Response(
            JSON.stringify({ success: false, message: "Payment failed", responseCode }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(JSON.stringify({ success: false, message: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST /vnpay/ipn - IPN callback from VNPay
    if (req.method === "POST" && path === "ipn") {
      const vnpParams = await req.json();
      const secureHash = vnpParams.vnp_SecureHash;

      delete vnpParams.vnp_SecureHash;
      delete vnpParams.vnp_SecureHashType;

      const sortedParams = sortObject(vnpParams);
      const signData = buildQueryString(sortedParams);
      const checkSum = await createSignature(signData, vnpayConfig.vnp_HashSecret);

      if (secureHash === checkSum) {
        const responseCode = vnpParams.vnp_ResponseCode;
        const orderId = vnpParams.vnp_TxnRef;
        const amount = parseInt(vnpParams.vnp_Amount) / 100;

        if (responseCode === "00") {
          await supabase
            .from("payment_history")
            .update({
              status: "completed",
              metadata: JSON.stringify(vnpParams),
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", orderId);

          return new Response(JSON.stringify({ RspCode: "00", Message: "Confirm Success" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ RspCode: "97", Message: "Invalid Checksum" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Test endpoint
    if (req.method === "GET" && path === "test") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "VNPay Edge Function is ready!",
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("VNPay error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
