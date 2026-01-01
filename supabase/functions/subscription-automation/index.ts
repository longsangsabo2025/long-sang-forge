import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ADMIN_EMAIL = "longsangsabo@gmail.com";

/**
 * Subscription Automation Edge Function
 *
 * This function handles automated tasks for subscriptions:
 * 1. Send renewal reminders (7 days before expiry)
 * 2. Mark expired subscriptions
 * 3. Send thank you emails after 30 days
 *
 * Should be called by a cron job daily
 */

interface Subscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_id: string;
  status: string;
  expires_at: string;
  created_at: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results = {
      renewalReminders: 0,
      expiredMarked: 0,
      thankYouEmails: 0,
      errors: [] as string[],
    };

    const now = new Date();

    // 1. Send renewal reminders (expiring in 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

    const { data: expiringSoon } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("expires_at", sixDaysFromNow.toISOString())
      .lte("expires_at", sevenDaysFromNow.toISOString());

    for (const sub of expiringSoon || []) {
      try {
        await resend.emails.send({
          from: "Long Sang <noreply@longsang.org>",
          to: sub.user_email,
          subject: `⏰ Gói ${sub.plan_id.toUpperCase()} của bạn sắp hết hạn - Long Sang`,
          html: getRenewalReminderEmail(sub),
        });
        results.renewalReminders++;
        console.log(`Sent renewal reminder to ${sub.user_email}`);
      } catch (err) {
        results.errors.push(`Renewal email failed for ${sub.user_email}: ${err}`);
      }
    }

    // 2. Mark expired subscriptions
    const { data: expired, error: expiredError } = await supabase
      .from("user_subscriptions")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("expires_at", now.toISOString())
      .select();

    if (!expiredError && expired) {
      results.expiredMarked = expired.length;

      // Notify admin about expired subscriptions
      if (expired.length > 0) {
        const expiredList = expired
          .map((s: Subscription) => `- ${s.user_email} (${s.plan_id})`)
          .join("\n");

        await resend.emails.send({
          from: "Long Sang System <noreply@longsang.org>",
          to: ADMIN_EMAIL,
          subject: `⚠️ ${expired.length} subscriptions đã hết hạn`,
          html: `
            <h2>Subscriptions hết hạn hôm nay</h2>
            <pre>${expiredList}</pre>
            <p>Thời gian: ${now.toLocaleString("vi-VN")}</p>
          `,
        });
      }
    }

    // 3. Send thank you emails (30 days after signup)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);

    const { data: thirtyDayUsers } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("created_at", thirtyOneDaysAgo.toISOString())
      .lte("created_at", thirtyDaysAgo.toISOString())
      .neq("plan_id", "free");

    for (const sub of thirtyDayUsers || []) {
      try {
        await resend.emails.send({
          from: "Long Sang <noreply@longsang.org>",
          to: sub.user_email,
          subject: `🎉 Cảm ơn 1 tháng đồng hành! - Long Sang`,
          html: getThankYouEmail(sub),
        });
        results.thankYouEmails++;
        console.log(`Sent thank you email to ${sub.user_email}`);
      } catch (err) {
        results.errors.push(`Thank you email failed for ${sub.user_email}: ${err}`);
      }
    }

    // Send summary to admin
    await resend.emails.send({
      from: "Long Sang System <noreply@longsang.org>",
      to: ADMIN_EMAIL,
      subject: `📊 Subscription Automation Report - ${now.toLocaleDateString("vi-VN")}`,
      html: `
        <h2>Báo cáo tự động hóa Subscription</h2>
        <ul>
          <li>📧 Renewal reminders sent: ${results.renewalReminders}</li>
          <li>⏰ Expired subscriptions marked: ${results.expiredMarked}</li>
          <li>🎉 Thank you emails sent: ${results.thankYouEmails}</li>
          ${results.errors.length > 0 ? `<li>❌ Errors: ${results.errors.length}</li>` : ""}
        </ul>
        ${
          results.errors.length > 0 ? `<h3>Errors:</h3><pre>${results.errors.join("\n")}</pre>` : ""
        }
        <p><small>Time: ${now.toLocaleString("vi-VN")}</small></p>
      `,
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Subscription automation error:", error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Email Templates
function getRenewalReminderEmail(sub: Subscription): string {
  const expiresAt = new Date(sub.expires_at).toLocaleDateString("vi-VN");
  const planName = sub.plan_id.toUpperCase();

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⏰ Sắp Hết Hạn!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Gói ${planName} của bạn sẽ hết hạn trong 7 ngày</p>
      </div>

      <div style="padding: 32px 24px;">
        <p>Xin chào <strong>${sub.user_name}</strong>,</p>

        <p>Gói đăng ký <strong>${planName}</strong> của bạn sẽ hết hạn vào ngày <strong>${expiresAt}</strong>.</p>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>⚠️ Lưu ý:</strong> Sau khi hết hạn, bạn sẽ không còn truy cập được các tính năng premium.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="https://longsang.org/pricing"
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🔄 Gia Hạn Ngay
          </a>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #16a34a;">
            <strong>💡 Mẹo:</strong> Chọn gói năm để tiết kiệm 17% (được 2 tháng miễn phí!)
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của Long Sang!
        </p>
      </div>

      <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© 2024 Long Sang | <a href="https://longsang.org" style="color: #3b82f6;">longsang.org</a></p>
      </div>
    </div>
  `;
}

function getThankYouEmail(sub: Subscription): string {
  const planName = sub.plan_id.toUpperCase();

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Cảm Ơn Bạn!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">1 tháng đồng hành cùng Long Sang</p>
      </div>

      <div style="padding: 32px 24px;">
        <p>Xin chào <strong>${sub.user_name}</strong>,</p>

        <p>Đã 1 tháng kể từ khi bạn tham gia gói <strong>${planName}</strong>! 🎊</p>

        <p>Cảm ơn bạn đã tin tưởng và đồng hành. Chúng tôi hy vọng bạn đã có những trải nghiệm tuyệt vời với:</p>

        <ul style="line-height: 2;">
          ${
            sub.plan_id === "vip"
              ? `
            <li>📡 Cập nhật AI real-time</li>
            <li>🚀 Early access sản phẩm mới</li>
            <li>💬 Chat trực tiếp với founder</li>
            <li>💎 Ưu tiên cơ hội đầu tư</li>
          `
              : `
            <li>📡 Cập nhật AI hàng tuần</li>
            <li>🚀 Thông báo sản phẩm mới</li>
            <li>🎨 Truy cập Showcase premium</li>
          `
          }
        </ul>

        <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #0369a1;">
            <strong>💬 Feedback:</strong> Bạn có góp ý gì không? Reply email này để chia sẻ nhé!
          </p>
        </div>

        ${
          sub.plan_id === "pro"
            ? `
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; font-weight: bold; color: #92400e;">
              👑 Nâng cấp lên VIP để mở khóa thêm!
            </p>
            <a href="https://longsang.org/pricing"
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Xem gói VIP
            </a>
          </div>
        `
            : ""
        }

        <p style="color: #6b7280; font-size: 14px;">
          Chúc bạn tiếp tục có những trải nghiệm tuyệt vời!<br>
          <strong>Long Sang</strong>
        </p>
      </div>

      <div style="background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280;">
        <p>© 2024 Long Sang | <a href="https://longsang.org" style="color: #3b82f6;">longsang.org</a></p>
      </div>
    </div>
  `;
}
