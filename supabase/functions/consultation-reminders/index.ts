/**
 * Consultation Reminders Edge Function
 * Sends reminder emails before consultations:
 * - 24 hours before
 * - 1 hour before
 *
 * Triggered by Supabase Cron (pg_cron) every 15 minutes
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface Consultation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  consultation_date: string;
  start_time: string;
  consultation_type: string;
  notes: string | null;
  meeting_link: string | null;
  reminder_sent: boolean;
  payment_status: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
}

function get24HourReminderEmail(consultation: Consultation): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #eee; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .info-row { display: flex; margin: 10px 0; }
    .info-label { font-weight: bold; width: 120px; color: #666; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">📅</div>
      <h1>Nhắc nhở buổi tư vấn ngày mai!</h1>
    </div>
    <div class="content">
      <p>Xin chào <strong>${consultation.client_name}</strong>,</p>
      <p>Đây là email nhắc nhở về buổi tư vấn của bạn với <strong>Long Sang</strong> vào ngày mai.</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">📆 Ngày:</span>
          <span>${formatDate(consultation.consultation_date)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">⏰ Giờ:</span>
          <span>${formatTime(consultation.start_time)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📦 Gói:</span>
          <span>${consultation.consultation_type}</span>
        </div>
        ${
          consultation.meeting_link
            ? `
        <div class="info-row">
          <span class="info-label">🔗 Link:</span>
          <a href="${consultation.meeting_link}">${consultation.meeting_link}</a>
        </div>
        `
            : ""
        }
      </div>

      <p><strong>Lưu ý quan trọng:</strong></p>
      <ul>
        <li>Vui lòng chuẩn bị sẵn các câu hỏi hoặc vấn đề bạn muốn thảo luận</li>
        <li>Đảm bảo kết nối internet ổn định</li>
        <li>Tham gia đúng giờ để tận dụng tối đa thời gian tư vấn</li>
      </ul>

      <p>Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ qua:</p>
      <ul>
        <li>Email: lss2ps@gmail.com</li>
        <li>Zalo: 0961167717</li>
      </ul>
    </div>
    <div class="footer">
      <p>© 2025 Long Sang. Chúc bạn có buổi tư vấn hiệu quả!</p>
    </div>
  </div>
</body>
</html>
  `;
}

function get1HourReminderEmail(consultation: Consultation): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #eee; }
    .urgent-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #ffc107; text-align: center; }
    .button { display: inline-block; background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-size: 18px; font-weight: bold; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    .emoji { font-size: 48px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">⏰</div>
      <h1>Buổi tư vấn sẽ bắt đầu trong 1 giờ!</h1>
    </div>
    <div class="content">
      <p>Xin chào <strong>${consultation.client_name}</strong>,</p>

      <div class="urgent-box">
        <h2 style="margin: 0; color: #856404;">🔔 Buổi tư vấn của bạn bắt đầu lúc ${formatTime(
          consultation.start_time
        )}</h2>
        <p style="margin: 10px 0 0 0;">Chỉ còn <strong>1 giờ</strong> nữa thôi!</p>
      </div>

      ${
        consultation.meeting_link
          ? `
      <p style="text-align: center;">
        <a href="${consultation.meeting_link}" class="button">🚀 Tham gia ngay</a>
      </p>
      `
          : `
      <p style="text-align: center; color: #666;">
        Link tham gia sẽ được gửi qua Zalo/Email trước giờ bắt đầu.
      </p>
      `
      }

      <p><strong>Checklist nhanh:</strong></p>
      <ul>
        <li>✅ Kiểm tra micro và camera</li>
        <li>✅ Tắt các thông báo không cần thiết</li>
        <li>✅ Chuẩn bị ghi chú</li>
        <li>✅ Đảm bảo không gian yên tĩnh</li>
      </ul>
    </div>
    <div class="footer">
      <p>© 2025 Long Sang. Hẹn gặp bạn ngay!</p>
    </div>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const results = {
      checked: 0,
      sent24h: 0,
      sent1h: 0,
      errors: [] as string[],
    };

    // Get confirmed consultations in the next 25 hours that haven't been reminded
    const next25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrowStr = next25Hours.toISOString().slice(0, 10);

    const { data: consultations, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("payment_status", "confirmed")
      .in("consultation_date", [todayStr, tomorrowStr])
      .order("consultation_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Database error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    results.checked = consultations?.length || 0;
    console.log(`[Reminders] Checking ${results.checked} consultations`);

    for (const consultation of consultations || []) {
      // Calculate time until consultation
      const consultationDateTime = new Date(
        `${consultation.consultation_date}T${consultation.start_time}`
      );
      const hoursUntil = (consultationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      console.log(
        `[Reminders] ${consultation.client_name}: ${hoursUntil.toFixed(1)}h until consultation`
      );

      // Check reminder metadata
      const metadata = (consultation.reminder_metadata as Record<string, unknown>) || {};
      const sent24h = metadata.sent_24h_reminder === true;
      const sent1h = metadata.sent_1h_reminder === true;

      try {
        // 24-hour reminder (between 23-25 hours before)
        if (!sent24h && hoursUntil >= 23 && hoursUntil <= 25) {
          await resend.emails.send({
            from: "Long Sang <noreply@longsang.org>",
            to: consultation.client_email,
            subject: `📅 Nhắc nhở: Buổi tư vấn của bạn vào ngày mai - ${formatTime(
              consultation.start_time
            )}`,
            html: get24HourReminderEmail(consultation),
          });

          await supabase
            .from("consultations")
            .update({
              reminder_metadata: {
                ...metadata,
                sent_24h_reminder: true,
                sent_24h_at: now.toISOString(),
              },
            })
            .eq("id", consultation.id);

          results.sent24h++;
          console.log(`[Reminders] ✅ 24h reminder sent to ${consultation.client_email}`);
        }

        // 1-hour reminder (between 0.5-1.5 hours before)
        if (!sent1h && hoursUntil >= 0.5 && hoursUntil <= 1.5) {
          await resend.emails.send({
            from: "Long Sang <noreply@longsang.org>",
            to: consultation.client_email,
            subject: `⏰ Sắp bắt đầu! Buổi tư vấn của bạn lúc ${formatTime(
              consultation.start_time
            )}`,
            html: get1HourReminderEmail(consultation),
          });

          await supabase
            .from("consultations")
            .update({
              reminder_metadata: {
                ...metadata,
                sent_1h_reminder: true,
                sent_1h_at: now.toISOString(),
              },
            })
            .eq("id", consultation.id);

          results.sent1h++;
          console.log(`[Reminders] ✅ 1h reminder sent to ${consultation.client_email}`);
        }
      } catch (emailError) {
        const errorMsg = `Failed to send reminder to ${consultation.client_email}: ${emailError}`;
        console.error(`[Reminders] ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    console.log(
      `[Reminders] Done. Sent: ${results.sent24h} (24h) + ${results.sent1h} (1h) reminders`
    );

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[Reminders] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
