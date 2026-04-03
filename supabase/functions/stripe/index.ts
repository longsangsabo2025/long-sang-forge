/**
 * Stripe Payment Edge Function
 * Handles: checkout sessions, customer portal, webhooks
 * Pattern: matches VNPay Edge Function architecture
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const appUrl = Deno.env.get("APP_URL") || "https://longsang.org";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Plan ID → Stripe Price ID mapping (set via env or DB)
async function getStripePriceId(
  planId: string,
  billingCycle: string
): Promise<string | null> {
  const column =
    billingCycle === "yearly"
      ? "stripe_price_id_yearly"
      : "stripe_price_id_monthly";

  const { data } = await supabase
    .from("subscription_plans")
    .select(column)
    .eq("id", planId)
    .single();

  return data?.[column] || null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // ============================================
    // POST /stripe/create-checkout-session
    // ============================================
    if (req.method === "POST" && path === "create-checkout-session") {
      const { planId, userId, billingCycle = "monthly" } = await req.json();

      if (!planId || !userId) {
        return new Response(
          JSON.stringify({ error: "planId and userId are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get plan from DB
      const { data: plan, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (planError || !plan) {
        return new Response(
          JSON.stringify({ error: "Plan not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get or create Stripe price ID
      const priceId = await getStripePriceId(planId, billingCycle);
      if (!priceId) {
        return new Response(
          JSON.stringify({
            error: `No Stripe price configured for plan "${planId}" (${billingCycle})`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Check if user already has a Stripe customer ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id, email, full_name")
        .eq("id", userId)
        .single();

      let customerId = profile?.stripe_customer_id;

      // Create Stripe customer if not exists
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile?.email || undefined,
          name: profile?.full_name || undefined,
          metadata: { user_id: userId },
        });
        customerId = customer.id;

        // Save customer ID to profile
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pricing?canceled=true`,
        metadata: {
          user_id: userId,
          plan_id: planId,
          billing_cycle: billingCycle,
        },
        subscription_data: {
          metadata: {
            user_id: userId,
            plan_id: planId,
          },
        },
      });

      // Store pending payment
      await supabase.from("payment_history").insert({
        user_id: userId,
        plan_id: planId,
        amount: billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly,
        currency: "USD",
        status: "pending",
        payment_method: "stripe",
        transaction_id: session.id,
        metadata: JSON.stringify({
          stripe_session_id: session.id,
          billing_cycle: billingCycle,
        }),
        created_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          url: session.url,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // POST /stripe/customer-portal
    // ============================================
    if (req.method === "POST" && path === "customer-portal") {
      const { userId } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "userId is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get Stripe customer ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id")
        .eq("id", userId)
        .single();

      if (!profile?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: "No Stripe customer found for this user" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${appUrl}/settings/billing`,
      });

      return new Response(
        JSON.stringify({ url: portalSession.url }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ============================================
    // POST /stripe/webhook
    // ============================================
    if (req.method === "POST" && path === "webhook") {
      const body = await req.text();
      const signature = req.headers.get("stripe-signature");

      let event: Stripe.Event;

      // Verify webhook signature
      if (stripeWebhookSecret && signature) {
        try {
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            stripeWebhookSecret
          );
        } catch (err) {
          console.error("Webhook signature verification failed:", err.message);
          return new Response(
            JSON.stringify({ error: "Invalid signature" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } else {
        // No webhook secret configured — parse directly (dev mode)
        event = JSON.parse(body);
      }

      // Handle events
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.user_id;
          const planId = session.metadata?.plan_id;
          const billingCycle = session.metadata?.billing_cycle || "monthly";

          if (userId && planId) {
            // Update payment history
            await supabase
              .from("payment_history")
              .update({
                status: "completed",
                metadata: JSON.stringify(session),
                updated_at: new Date().toISOString(),
              })
              .eq("transaction_id", session.id);

            // Activate subscription
            const { data: plan } = await supabase
              .from("subscription_plans")
              .select("duration_days")
              .eq("id", planId)
              .single();

            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(
              endDate.getDate() + (plan?.duration_days || 30)
            );

            await supabase.from("user_subscriptions").upsert(
              {
                user_id: userId,
                plan_id: planId,
                status: "active",
                payment_status: "confirmed",
                billing_cycle: billingCycle,
                current_period_start: now.toISOString(),
                current_period_end: endDate.toISOString(),
                stripe_subscription_id:
                  session.subscription as string,
                auto_renew: true,
                updated_at: now.toISOString(),
              },
              { onConflict: "user_id" }
            );
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data
            .object as Stripe.Subscription;
          const userId = subscription.metadata?.user_id;

          if (userId) {
            const status =
              subscription.status === "active"
                ? "active"
                : subscription.status === "canceled"
                ? "cancelled"
                : "expired";

            await supabase
              .from("user_subscriptions")
              .update({
                status,
                auto_renew: !subscription.cancel_at_period_end,
                current_period_end: new Date(
                  subscription.current_period_end * 1000
                ).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data
            .object as Stripe.Subscription;
          const userId = subscription.metadata?.user_id;

          if (userId) {
            await supabase
              .from("user_subscriptions")
              .update({
                status: "cancelled",
                auto_renew: false,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          // Find user by Stripe customer ID
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            await supabase
              .from("user_subscriptions")
              .update({
                payment_status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", profile.id);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================
    // GET /stripe/test — Health check
    // ============================================
    if (req.method === "GET" && path === "test") {
      const hasKey = !!stripeSecretKey;
      return new Response(
        JSON.stringify({
          success: true,
          message: "Stripe Edge Function is ready!",
          configured: hasKey,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 404 fallback
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
