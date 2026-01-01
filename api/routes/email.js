/**
 * Email Service Integration
 * Supports SendGrid and Resend
 */

const express = require("express");
const router = express.Router();

// Initialize email providers
const sgMail = require("@sendgrid/mail");
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Email Templates
 */
const templates = {
  welcome: (data) => ({
    subject: `Welcome to ${data.appName || "Long Sang Automation"}! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature { margin: 10px 0; padding-left: 25px; position: relative; }
          .feature:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to ${data.appName || "Long Sang Automation"}!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name || "there"},</h2>
            <p>Thank you for joining us! We're excited to help you automate your business and save time.</p>

            <div class="features">
              <h3>Your Free Plan includes:</h3>
              <div class="feature">10 AI-powered workflows per month</div>
              <div class="feature">1,000 API calls</div>
              <div class="feature">Basic analytics dashboard</div>
              <div class="feature">Community support</div>
            </div>

            <p>Ready to get started?</p>
            <a href="${data.dashboardUrl}" class="button">Go to Dashboard →</a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Need help? Check out our <a href="${
                data.docsUrl || "#"
              }">documentation</a> or <a href="${data.supportUrl || "#"}">contact support</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ${data.appName}!\n\nHi ${data.name},\n\nThank you for joining us! Visit your dashboard: ${data.dashboardUrl}`,
  }),

  invoice: (data) => ({
    subject: `Payment Receipt - ${data.planName} Plan`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .total { font-weight: bold; font-size: 18px; color: #10b981; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Successful</h1>
          </div>
          <div class="content">
            <h2>Thank you for your payment!</h2>
            <p>Your ${data.planName} subscription has been confirmed.</p>

            <div class="invoice">
              <h3>Invoice Details</h3>
              <div class="row">
                <span>Invoice #</span>
                <span>${data.invoiceNumber || "N/A"}</span>
              </div>
              <div class="row">
                <span>Date</span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="row">
                <span>${data.planName} Plan</span>
                <span>$${data.amount}</span>
              </div>
              <div class="row total">
                <span>Total Paid</span>
                <span>$${data.amount}</span>
              </div>
            </div>

            ${
              data.receiptUrl
                ? `<a href="${data.receiptUrl}" class="button">View Full Receipt →</a>`
                : ""
            }

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Your subscription will automatically renew on ${
                data.renewalDate || "next billing date"
              }.
              You can manage your subscription anytime in your <a href="${
                data.dashboardUrl
              }">dashboard</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment Receipt\n\nThank you for your payment of $${data.amount} for the ${data.planName} plan.\nInvoice: ${data.invoiceNumber}`,
  }),

  usageWarning: (data) => ({
    subject: `⚠️ Usage Alert: ${data.percentage}% of your limit`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .usage-bar { background: #e5e7eb; height: 30px; border-radius: 15px; overflow: hidden; margin: 20px 0; }
          .usage-fill { background: ${
            data.percentage >= 100 ? "#ef4444" : data.percentage >= 80 ? "#f59e0b" : "#10b981"
          }; height: 100%; width: ${Math.min(
      data.percentage,
      100
    )}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Usage Alert</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>

            <div class="warning">
              <strong>You've used ${data.percentage}% of your ${data.metric} limit</strong>
            </div>

            <p>Current usage: <strong>${data.current} / ${data.limit}</strong> ${data.metric}</p>

            <div class="usage-bar">
              <div class="usage-fill">${data.percentage}%</div>
            </div>

            <p>${
              data.percentage >= 100
                ? "You have reached your limit. Upgrade your plan to continue using this feature."
                : "Consider upgrading your plan to avoid service interruption."
            }</p>

            <a href="${data.upgradeUrl}" class="button">Upgrade Plan →</a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Your usage resets on ${data.resetDate}. View detailed usage in your <a href="${
      data.dashboardUrl
    }">dashboard</a>.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Usage Alert\n\nYou've used ${data.percentage}% of your ${data.metric} limit (${data.current}/${data.limit}).\n\nUpgrade: ${data.upgradeUrl}`,
  }),

  paymentFailed: (data) => ({
    subject: "⚠️ Payment Failed - Action Required",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Failed</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.name},</h2>

            <div class="alert">
              <strong>We couldn't process your payment for the ${data.planName} plan.</strong>
            </div>

            <p>Reason: ${data.reason || "Payment method declined"}</p>

            <p>Please update your payment method to continue enjoying premium features.</p>

            <a href="${data.updatePaymentUrl}" class="button">Update Payment Method →</a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you don't update your payment method, your account will be downgraded to the Free plan on ${
                data.downgradeDate
              }.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment Failed\n\nWe couldn't process your payment for the ${data.planName} plan.\nPlease update your payment method: ${data.updatePaymentUrl}`,
  }),

  // Contact form notification to admin
  newContact: (data) => ({
    subject: `📬 ${data.name} vừa liên hệ qua website`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">📬 Có khách mới liên hệ!</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 8px 0;"><strong>👤 Khách hàng:</strong> ${data.name}</p>
            <p style="margin: 8px 0;"><strong>📧 Email:</strong> <a href="mailto:${
              data.email
            }" style="color: #3B82F6;">${data.email}</a></p>
            <p style="margin: 8px 0;"><strong>🔧 Quan tâm:</strong> ${
              data.service || "Chưa chọn dịch vụ"
            }</p>
          </div>
          <div style="background: #FFF; padding: 20px; border-left: 4px solid #3B82F6; margin-top: 15px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1F2937;">💬 Nội dung:</p>
            <p style="margin: 0; white-space: pre-wrap; color: #4B5563; line-height: 1.6;">${
              data.message
            }</p>
          </div>
          <p style="margin-top: 20px; color: #6B7280; font-size: 13px;">Phản hồi sớm để không bỏ lỡ khách hàng tiềm năng nhé! 🚀</p>
        </div>
      </div>
    `,
    text: `Khách mới: ${data.name}\nEmail: ${data.email}\nDịch vụ: ${data.service}\nNội dung: ${data.message}`,
  }),

  // Auto-reply to contact
  contactAutoReply: (data) => ({
    subject: "✅ Tôi đã nhận được tin nhắn của bạn!",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">Chào ${data.name}! 👋</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; line-height: 1.8; color: #374151;">Cảm ơn bạn đã liên hệ! Tôi đã nhận được thông tin và sẽ <strong>phản hồi trong vòng 24 giờ</strong> làm việc.</p>
          <p style="font-size: 16px; line-height: 1.8; color: #374151;">Trong thời gian chờ đợi, bạn có thể xem qua các dịch vụ của tôi tại <a href="https://longsang.org" style="color: #3B82F6; text-decoration: none; font-weight: 600;">longsang.org</a></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">Trân trọng,</p>
            <p style="margin: 5px 0 0 0; color: #1F2937; font-weight: 600;">Sang - AI Solutions</p>
          </div>
        </div>
      </div>
    `,
    text: `Chào ${data.name}!\n\nCảm ơn bạn đã liên hệ! Tôi đã nhận được thông tin và sẽ phản hồi trong 24 giờ.\n\nTrân trọng,\nSang`,
  }),

  // Consultation booking confirmation
  consultationBooked: (data) => ({
    subject: "📅 Đã xác nhận lịch hẹn với Sang!",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0; font-size: 24px;">Hẹn gặp bạn, ${data.name}! 🎯</h2>
        </div>
        <div style="padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; line-height: 1.8; color: #374151;">Tuyệt vời! Tôi đã ghi nhận lịch hẹn của bạn.</p>
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border: 1px solid #BBF7D0;">
            <p style="margin: 10px 0; font-size: 16px;"><strong>📆 Ngày:</strong> ${data.date}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>⏰ Giờ:</strong> ${data.time}</p>
            <p style="margin: 10px 0; font-size: 16px;"><strong>🎯 Chủ đề:</strong> ${
              data.type || "Tư vấn chung"
            }</p>
          </div>
          <p style="font-size: 16px; line-height: 1.8; color: #374151;">Tôi sẽ gửi <strong>link Google Meet trước 30 phút</strong> để mình có thể trao đổi trực tiếp nhé!</p>
          <p style="font-size: 15px; line-height: 1.8; color: #6B7280; margin-top: 15px;">💡 <em>Tip: Chuẩn bị sẵn những câu hỏi bạn muốn trao đổi để buổi tư vấn hiệu quả hơn.</em></p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; color: #6B7280; font-size: 14px;">Hẹn gặp bạn sớm,</p>
            <p style="margin: 5px 0 0 0; color: #1F2937; font-weight: 600;">Sang 🚀</p>
          </div>
        </div>
      </div>
    `,
    text: `Chào ${data.name}!\n\nTôi đã ghi nhận lịch hẹn:\n- Ngày: ${data.date}\n- Giờ: ${data.time}\n- Chủ đề: ${data.type}\n\nTôi sẽ gửi link meeting trước 30 phút.\n\nHẹn gặp bạn!\nSang`,
  }),
};

/**
 * Send email via SendGrid
 */
async function sendWithSendGrid(to, template, data) {
  const emailContent = templates[template](data);

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || "noreply@longsang.automation",
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  };

  await sgMail.send(msg);
  console.log(`Email sent to ${to} via SendGrid`);
}

/**
 * Send email via Resend
 */
async function sendWithResend(to, template, data) {
  const emailContent = templates[template](data);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.VITE_RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Sang <hello@longsang.org>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Resend error:", errorData);
    throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
  }

  console.log(`Email sent to ${to} via Resend`);
}

/**
 * Send email (auto-detect provider)
 * POST /api/email/send
 */
router.post("/send", async (req, res) => {
  try {
    const { to, template, data } = req.body;

    if (!to || !template) {
      return res.status(400).json({ error: "Missing required fields: to, template" });
    }

    if (!templates[template]) {
      return res.status(400).json({ error: `Unknown template: ${template}` });
    }

    // Try SendGrid first, fallback to Resend
    if (process.env.SENDGRID_API_KEY) {
      await sendWithSendGrid(to, template, data);
    } else if (process.env.VITE_RESEND_API_KEY) {
      await sendWithResend(to, template, data);
    } else {
      return res.status(500).json({ error: "No email provider configured" });
    }

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
});

/**
 * Test email endpoint
 * POST /api/email/test
 */
router.post("/test", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Missing email address" });
    }

    const testData = {
      name: "Test User",
      appName: "Long Sang Automation",
      dashboardUrl: "http://localhost:5173/admin",
      docsUrl: "http://localhost:5173/docs",
      supportUrl: "http://localhost:5173/support",
    };

    if (process.env.SENDGRID_API_KEY) {
      await sendWithSendGrid(to, "welcome", testData);
    } else if (process.env.VITE_RESEND_API_KEY) {
      await sendWithResend(to, "welcome", testData);
    } else {
      return res.status(500).json({ error: "No email provider configured" });
    }

    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      error: "Failed to send test email",
      message: error.message,
    });
  }
});

module.exports = router;
