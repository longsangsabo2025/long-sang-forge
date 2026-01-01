import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// 🎨 EMAIL STYLES - Consistent branding
// ============================================
const styles = {
  container: `font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;`,
  header: `background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px 24px; text-align: center;`,
  headerTitle: `color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;`,
  headerSubtitle: `color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;`,
  body: `padding: 32px 24px;`,
  card: `background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;`,
  cardSuccess: `background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 20px 0;`,
  cardWarning: `background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 12px; margin: 20px 0;`,
  cardInfo: `background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 12px; margin: 20px 0;`,
  cardUrgent: `background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 12px; margin: 20px 0;`,
  button: `display: inline-block; background: #2563eb; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;`,
  buttonSuccess: `display: inline-block; background: #16a34a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;`,
  footer: `background: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;`,
  footerText: `color: #64748b; font-size: 12px; margin: 0;`,
  signature: `margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;`,
  label: `color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;`,
};

// ============================================
// 📧 EMAIL TEMPLATES BY CUSTOMER JOURNEY
// ============================================
const getTemplates = (data: Record<string, string>) => ({
  // ==========================================
  // 🟢 STAGE 1: LEAD CAPTURE (Thu thập lead)
  // ==========================================

  // 1.1 Thông báo cho Admin - Có lead mới
  newContact: {
    subject: `🔔 Lead mới: ${data.name} - ${data.service || "Chưa chọn DV"} ${
      data.budget ? `(${data.budget})` : ""
    }`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">🔔 Lead Mới!</h1>
          <p style="${styles.headerSubtitle}">Có khách hàng tiềm năng vừa liên hệ</p>
        </div>
        <div style="${styles.body}">
          <div style="${styles.card}">
            <p style="${styles.label}">THÔNG TIN KHÁCH HÀNG</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>👤 Tên:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${
                data.name
              }</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>📧 Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><a href="mailto:${
                data.email
              }">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>📱 SĐT:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${
                data.phone || "Không cung cấp"
              }</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>🎯 Dịch vụ:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">${
                data.service || "Chưa chọn"
              }</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>💰 Ngân sách:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong style="color: #16a34a;">${
                data.budget || "Chưa xác định"
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📢 Nguồn:</strong></td><td style="padding: 8px 0;">${
                data.source || "Website"
              }</td></tr>
            </table>
          </div>
          ${
            data.message
              ? `
          <div style="${styles.cardInfo}">
            <p style="${styles.label}">💬 TIN NHẮN</p>
            <p style="margin: 0; line-height: 1.6;">${data.message}</p>
          </div>
          `
              : ""
          }
          <p style="text-align: center;">
            <a href="https://longsang.org/admin/simple" style="${
              styles.button
            }">📋 Xem trong CRM</a>
          </p>
          <p style="color: #64748b; font-size: 13px; text-align: center;">⏰ ${new Date().toLocaleString(
            "vi-VN"
          )}</p>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">Email tự động từ Long Sang CRM</p>
        </div>
      </div>
    `,
  },

  // 1.2 Auto-reply cho khách - Đã nhận tin nhắn
  contactAutoReply: {
    subject: "✅ Sang đã nhận tin nhắn của bạn!",
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Xin chào ${data.name}! 👋</h1>
          <p style="${styles.headerSubtitle}">Cảm ơn bạn đã liên hệ</p>
        </div>
        <div style="${styles.body}">
          <p style="font-size: 16px; line-height: 1.6;">Mình đã nhận được tin nhắn của bạn và sẽ phản hồi <strong>trong vòng 24 giờ</strong> (thường nhanh hơn nhiều 😊).</p>

          <div style="${styles.cardInfo}">
            <p style="margin: 0 0 8px 0;"><strong>💡 Trong thời gian chờ đợi:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Xem <a href="https://longsang.org/project-showcase" style="color: #2563eb;">các dự án mình đã làm</a></li>
              <li>Tìm hiểu về <a href="https://longsang.org/pricing" style="color: #2563eb;">bảng giá dịch vụ</a></li>
              <li>Chat ngay với <a href="https://longsang.org/#contact" style="color: #2563eb;">AI Assistant</a> của mình</li>
            </ul>
          </div>

          <div style="${styles.cardWarning}">
            <p style="margin: 0;"><strong>⚡ Cần gấp?</strong> Gọi trực tiếp: <a href="tel:+84123456789" style="color: #2563eb; font-weight: 600;">0123 456 789</a></p>
          </div>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // ==========================================
  // 🟡 STAGE 2: CONSULTATION (Tư vấn)
  // ==========================================

  // 2.1 Xác nhận đặt lịch tư vấn
  consultationBooked: {
    subject: `📅 Xác nhận lịch hẹn: ${data.date} lúc ${data.time}`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Lịch hẹn đã được xác nhận! ✅</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Cảm ơn bạn đã đặt lịch tư vấn với mình. Dưới đây là thông tin chi tiết:</p>

          <div style="${styles.cardSuccess}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>📆 Ngày:</strong></td><td style="padding: 8px 0;">${
                data.date
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>⏰ Giờ:</strong></td><td style="padding: 8px 0;">${
                data.time
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📋 Nội dung:</strong></td><td style="padding: 8px 0;">${
                data.type || "Tư vấn giải pháp AI"
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📍 Hình thức:</strong></td><td style="padding: 8px 0;">${
                data.method || "Google Meet / Zalo"
              }</td></tr>
            </table>
          </div>

          <div style="${styles.cardInfo}">
            <p style="margin: 0 0 8px 0;"><strong>📝 Chuẩn bị trước buổi tư vấn:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Mô tả ngắn về vấn đề/nhu cầu của bạn</li>
              <li>Ngân sách dự kiến (nếu có)</li>
              <li>Timeline mong muốn</li>
            </ul>
          </div>

          <p style="color: #64748b;">Mình sẽ gửi link meeting trước giờ hẹn 15 phút. Nếu cần đổi lịch, reply email này nhé!</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 2.2 Nhắc nhở trước buổi tư vấn (gửi trước 1 ngày)
  consultationReminder: {
    subject: `⏰ Nhắc nhở: Buổi tư vấn ngày mai lúc ${data.time}`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Nhắc nhở buổi tư vấn! ⏰</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Đây là email nhắc nhở về buổi tư vấn của chúng ta <strong>vào ngày mai</strong>:</p>

          <div style="${styles.cardWarning}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>📆 Ngày:</strong></td><td style="padding: 8px 0;">${
                data.date
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>⏰ Giờ:</strong></td><td style="padding: 8px 0;">${
                data.time
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📋 Nội dung:</strong></td><td style="padding: 8px 0;">${
                data.type || "Tư vấn giải pháp AI"
              }</td></tr>
            </table>
          </div>

          ${
            data.meetingLink
              ? `
          <p style="text-align: center;">
            <a href="${data.meetingLink}" style="${styles.button}">🔗 Link tham gia Meeting</a>
          </p>
          `
              : ""
          }

          <p>Nếu bạn cần đổi lịch hoặc hủy, vui lòng reply email này trước <strong>ít nhất 2 giờ</strong> nhé!</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Hẹn gặp bạn ngày mai! 👋</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 2.3 Cảm ơn sau buổi tư vấn + Next steps
  consultationFollowUp: {
    subject: `🙏 Cảm ơn ${data.name} - Tóm tắt buổi tư vấn`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Cảm ơn bạn! 🙏</h1>
          <p style="${styles.headerSubtitle}">Tóm tắt buổi tư vấn</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Cảm ơn bạn đã dành thời gian trao đổi với mình hôm nay. Dưới đây là tóm tắt:</p>

          <div style="${styles.card}">
            <p style="${styles.label}">📋 TÓM TẮT</p>
            <p style="margin: 0; line-height: 1.6;">${
              data.summary || "Đã trao đổi về nhu cầu và đề xuất giải pháp phù hợp."
            }</p>
          </div>

          <div style="${styles.cardInfo}">
            <p style="${styles.label}">📌 BƯỚC TIẾP THEO</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              ${
                data.nextSteps
                  ? data.nextSteps
                      .split("|")
                      .map((step: string) => `<li>${step}</li>`)
                      .join("")
                  : `
              <li>Mình sẽ gửi báo giá chi tiết trong 24-48h</li>
              <li>Bạn review và phản hồi</li>
              <li>Ký hợp đồng và bắt đầu dự án</li>
              `
              }
            </ul>
          </div>

          <p>Nếu có bất kỳ câu hỏi nào, đừng ngại reply email này nhé!</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // ==========================================
  // 🟠 STAGE 3: PROPOSAL & QUOTATION (Báo giá)
  // ==========================================

  // 3.1 Gửi báo giá
  quotationSent: {
    subject: `💼 Báo giá dự án: ${data.projectName || "Giải pháp AI"}`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Báo Giá Dự Án 💼</h1>
          <p style="${styles.headerSubtitle}">${
      data.projectName || "Giải pháp AI cho doanh nghiệp"
    }</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Dựa trên cuộc trao đổi của chúng ta, mình xin gửi báo giá chi tiết cho dự án:</p>

          <div style="${styles.cardSuccess}">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: #dcfce7;">
                <td style="padding: 12px; border-bottom: 1px solid #bbf7d0;"><strong>Dự án</strong></td>
                <td style="padding: 12px; border-bottom: 1px solid #bbf7d0;">${
                  data.projectName || "Giải pháp AI"
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Thời gian</strong></td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${
                  data.timeline || "2-4 tuần"
                }</td>
              </tr>
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>Tổng chi phí</strong></td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #16a34a; font-size: 18px;">${
                  data.price || "Liên hệ"
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 12px;"><strong>Hiệu lực</strong></td>
                <td style="padding: 12px;">${data.validUntil || "7 ngày"}</td>
              </tr>
            </table>
          </div>

          ${
            data.proposalLink
              ? `
          <p style="text-align: center;">
            <a href="${data.proposalLink}" style="${styles.button}">📄 Xem đề xuất chi tiết</a>
          </p>
          `
              : ""
          }

          <div style="${styles.cardInfo}">
            <p style="margin: 0;"><strong>💡 Ưu đãi đặc biệt:</strong> Ký hợp đồng trong 3 ngày tới được giảm thêm <strong>10%</strong>!</p>
          </div>

          <p>Nếu có bất kỳ câu hỏi nào về báo giá, đừng ngại liên hệ mình nhé!</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">📱 0123 456 789</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 3.2 Nhắc nhở báo giá sắp hết hạn
  quotationExpiring: {
    subject: `⚠️ Báo giá sắp hết hạn - ${data.projectName || "Dự án của bạn"}`,
    html: `
      <div style="${styles.container}">
        <div style="${
          styles.header
        }" style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);">
          <h1 style="${styles.headerTitle}">Báo giá sắp hết hạn! ⚠️</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Mình muốn nhắc bạn rằng báo giá cho dự án <strong>"${
            data.projectName
          }"</strong> sẽ hết hạn vào <strong>${data.expiryDate}</strong>.</p>

          <div style="${styles.cardUrgent}">
            <p style="margin: 0;"><strong>⏰ Còn ${
              data.daysLeft || "2"
            } ngày</strong> để được hưởng mức giá ưu đãi!</p>
          </div>

          <p>Nếu bạn cần thêm thời gian hoặc có câu hỏi, hãy cho mình biết nhé. Mình luôn sẵn sàng hỗ trợ!</p>

          <p style="text-align: center;">
            <a href="mailto:hello@longsang.org?subject=Re: Báo giá ${data.projectName}" style="${
      styles.button
    }">💬 Liên hệ ngay</a>
          </p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // ==========================================
  // 🔵 STAGE 4: PROJECT (Dự án)
  // ==========================================

  // 4.1 Chào mừng khách hàng mới - Bắt đầu dự án
  projectKickoff: {
    subject: `🚀 Chào mừng! Dự án "${data.projectName}" đã bắt đầu`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Chào mừng đến với team! 🚀</h1>
          <p style="${styles.headerSubtitle}">Dự án: ${data.projectName}</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Cảm ơn bạn đã tin tưởng và lựa chọn Long Sang! Mình rất vui được đồng hành cùng bạn trong dự án này.</p>

          <div style="${styles.cardSuccess}">
            <p style="${styles.label}">📋 THÔNG TIN DỰ ÁN</p>
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>Tên dự án:</strong></td><td>${data.projectName}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Ngày bắt đầu:</strong></td><td>${data.startDate}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>Dự kiến hoàn thành:</strong></td><td>${data.endDate}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>PM:</strong></td><td>Sang (hello@longsang.org)</td></tr>
            </table>
          </div>

          <div style="${styles.cardInfo}">
            <p style="${styles.label}">📌 CÁC BƯỚC TIẾP THEO</p>
            <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Mình sẽ gửi link Trello/Notion để theo dõi tiến độ</li>
              <li>Thiết lập kênh liên lạc (Zalo/Telegram group)</li>
              <li>Họp kickoff để làm rõ yêu cầu chi tiết</li>
            </ol>
          </div>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Cùng tạo nên điều tuyệt vời! 💪</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 4.2 Cập nhật tiến độ dự án
  projectUpdate: {
    subject: `📊 Cập nhật dự án: ${data.projectName} - ${data.progress || "50"}% hoàn thành`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Cập Nhật Dự Án 📊</h1>
          <p style="${styles.headerSubtitle}">${data.projectName}</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Dưới đây là cập nhật tiến độ dự án của bạn:</p>

          <div style="${styles.card}">
            <p style="margin: 0 0 12px 0;"><strong>Tiến độ: ${data.progress || "50"}%</strong></p>
            <div style="background: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #2563eb, #7c3aed); height: 100%; width: ${
                data.progress || "50"
              }%;"></div>
            </div>
          </div>

          <div style="${styles.cardSuccess}">
            <p style="${styles.label}">✅ ĐÃ HOÀN THÀNH</p>
            <p style="margin: 0; line-height: 1.6;">${
              data.completed || "- Thiết kế UI/UX\n- Phát triển frontend"
            }</p>
          </div>

          <div style="${styles.cardInfo}">
            <p style="${styles.label}">🔄 ĐANG THỰC HIỆN</p>
            <p style="margin: 0; line-height: 1.6;">${
              data.inProgress || "- Tích hợp API\n- Testing"
            }</p>
          </div>

          ${
            data.notes
              ? `
          <div style="${styles.cardWarning}">
            <p style="${styles.label}">📝 GHI CHÚ</p>
            <p style="margin: 0; line-height: 1.6;">${data.notes}</p>
          </div>
          `
              : ""
          }

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 4.3 Bàn giao dự án hoàn thành
  projectCompleted: {
    subject: `🎉 Chúc mừng! Dự án "${data.projectName}" đã hoàn thành!`,
    html: `
      <div style="${styles.container}">
        <div style="${
          styles.header
        }" style="background: linear-gradient(135deg, #16a34a 0%, #059669 100%);">
          <h1 style="${styles.headerTitle}">Dự án hoàn thành! 🎉</h1>
          <p style="${styles.headerSubtitle}">100% Completed</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Mình vui mừng thông báo dự án <strong>"${
            data.projectName
          }"</strong> đã hoàn thành thành công!</p>

          <div style="${styles.cardSuccess}">
            <p style="${styles.label}">📦 BÀN GIAO</p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Source code: ${data.sourceCode || "Đã gửi qua email riêng"}</li>
              <li>Tài liệu hướng dẫn: ${data.docs || "Đính kèm"}</li>
              <li>Access credentials: ${data.credentials || "Đã gửi qua email riêng"}</li>
            </ul>
          </div>

          <div style="${styles.cardInfo}">
            <p style="${styles.label}">🛡️ HỖ TRỢ SAU BÀN GIAO</p>
            <p style="margin: 0;">Bạn được hỗ trợ miễn phí <strong>${
              data.supportPeriod || "30 ngày"
            }</strong> kể từ ngày bàn giao. Sau đó, mình có các gói maintenance với giá ưu đãi dành cho khách hàng cũ.</p>
          </div>

          <div style="${styles.cardWarning}">
            <p style="margin: 0;"><strong>🙏 Một lời nhờ nhỏ:</strong> Nếu hài lòng với dự án, bạn có thể để lại đánh giá giúp mình được không?
            <a href="${
              data.reviewLink || "https://longsang.org"
            }" style="color: #2563eb;">Để lại đánh giá →</a></p>
          </div>

          <p>Cảm ơn bạn đã tin tưởng Long Sang! Hy vọng được hợp tác tiếp với bạn trong tương lai 🙏</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // ==========================================
  // 💜 STAGE 5: RETENTION (Chăm sóc sau bán)
  // ==========================================

  // 5.1 Hỏi thăm sau 30 ngày
  checkIn30Days: {
    subject: `👋 ${data.name}, dự án hoạt động thế nào rồi?`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Mình muốn hỏi thăm! 👋</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Đã được 1 tháng kể từ khi mình bàn giao dự án <strong>"${data.projectName}"</strong>. Mình muốn hỏi thăm xem mọi thứ hoạt động thế nào rồi?</p>

          <div style="${styles.cardInfo}">
            <p style="margin: 0;"><strong>🤔 Mình muốn biết:</strong></p>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
              <li>Hệ thống có chạy ổn định không?</li>
              <li>Có gặp vấn đề gì cần hỗ trợ không?</li>
              <li>Có feedback gì để mình cải thiện không?</li>
            </ul>
          </div>

          <p>Nếu cần hỗ trợ gì, đừng ngại reply email này nhé!</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 5.2 Ưu đãi cho khách hàng cũ
  loyaltyOffer: {
    subject: `🎁 Ưu đãi đặc biệt dành riêng cho ${data.name}!`,
    html: `
      <div style="${styles.container}">
        <div style="${
          styles.header
        }" style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);">
          <h1 style="${styles.headerTitle}">Ưu Đãi Đặc Biệt! 🎁</h1>
          <p style="${styles.headerSubtitle}">Dành riêng cho khách hàng thân thiết</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Là một trong những khách hàng đầu tiên của Long Sang, mình muốn gửi tặng bạn ưu đãi đặc biệt:</p>

          <div style="${styles.cardSuccess}">
            <p style="text-align: center; margin: 0;">
              <span style="font-size: 48px; font-weight: bold; color: #16a34a;">${
                data.discount || "20"
              }%</span>
              <br/>
              <span style="color: #64748b;">Giảm giá cho dự án tiếp theo</span>
            </p>
          </div>

          <div style="${styles.card}">
            <p style="margin: 0 0 8px 0;"><strong>🎯 Áp dụng cho:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Nâng cấp hệ thống hiện tại</li>
              <li>Dự án mới bất kỳ</li>
              <li>Gói maintenance hàng tháng</li>
            </ul>
          </div>

          <p style="text-align: center; color: #ef4444;"><strong>⏰ Có hiệu lực đến: ${
            data.validUntil || "31/01/2025"
          }</strong></p>

          <p style="text-align: center;">
            <a href="mailto:hello@longsang.org?subject=Sử dụng ưu đãi ${
              data.discount || "20"
            }%" style="${styles.buttonSuccess}">🎁 Sử dụng ngay</a>
          </p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // 5.3 Xin đánh giá/testimonial
  requestReview: {
    subject: `⭐ ${data.name}, bạn có thể giúp mình được không?`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">Một lời nhờ nhỏ 🙏</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Hy vọng bạn vẫn hài lòng với dự án <strong>"${
            data.projectName
          }"</strong> mà mình đã thực hiện.</p>
          <p>Mình có một lời nhờ nhỏ: Bạn có thể dành <strong>2 phút</strong> để lại đánh giá giúp mình được không? Điều này sẽ giúp mình rất nhiều trong việc phát triển! 🙏</p>

          <p style="text-align: center;">
            <a href="${data.reviewLink || "https://g.page/r/longsang/review"}" style="${
      styles.button
    }">⭐ Để lại đánh giá</a>
          </p>

          <div style="${styles.cardInfo}">
            <p style="margin: 0;"><strong>🎁 Cảm ơn bạn:</strong> Sau khi để lại đánh giá, mình sẽ tặng bạn <strong>voucher giảm 15%</strong> cho dự án tiếp theo!</p>
          </div>

          <p>Cảm ơn bạn rất nhiều! 🙏</p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // ==========================================
  // 🔴 ADMIN NOTIFICATIONS
  // ==========================================

  // Admin: Có người đặt lịch tư vấn
  adminConsultationBooked: {
    subject: `📅 Lịch hẹn mới: ${data.name} - ${data.date} ${data.time} ${
      data.price ? `(${data.price})` : ""
    }`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">📅 Lịch Hẹn Mới!</h1>
        </div>
        <div style="${styles.body}">
          <div style="${styles.cardWarning}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>👤 Khách hàng:</strong></td><td>${
                data.name
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📧 Email:</strong></td><td><a href="mailto:${
                data.email
              }">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📱 SĐT:</strong></td><td>${
                data.phone || "-"
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📆 Ngày:</strong></td><td><strong>${
                data.date
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>⏰ Giờ:</strong></td><td><strong>${
                data.time
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📋 Loại:</strong></td><td>${
                data.type || "Tư vấn chung"
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>💰 Phí:</strong></td><td><strong style="color: ${
                data.price && data.price !== "Miễn phí" ? "#f59e0b" : "#16a34a"
              };">${data.price || "Miễn phí"}</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>💳 Thanh toán:</strong></td><td><span style="background: ${
                data.paymentStatus === "Chờ xác nhận" ? "#fef3c7" : "#d1fae5"
              }; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${
      data.paymentStatus || "Miễn phí"
    }</span></td></tr>
              ${
                data.notes && data.notes !== "Không có ghi chú"
                  ? `<tr><td style="padding: 8px 0;"><strong>📝 Ghi chú:</strong></td><td>${data.notes}</td></tr>`
                  : ""
              }
            </table>
          </div>
          <p style="text-align: center;">
            <a href="https://longsang.org/admin/simple" style="${
              styles.button
            }">📋 Xem trong CRM</a>
          </p>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">Long Sang CRM</p>
        </div>
      </div>
    `,
  },

  // Payment confirmed - sent to client
  paymentConfirmed: {
    subject: `✅ Thanh toán thành công - Lịch hẹn ${data.date} đã được xác nhận!`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">✅ Thanh toán thành công!</h1>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.name}</strong>,</p>
          <p>Cảm ơn bạn! Thanh toán của bạn đã được xác nhận. Lịch hẹn tư vấn của bạn đã được confirm.</p>

          <div style="${styles.cardSuccess}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>📆 Ngày:</strong></td><td><strong>${
                data.date
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>⏰ Giờ:</strong></td><td><strong>${
                data.time
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📋 Loại:</strong></td><td>${
                data.type || "Tư vấn"
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>💳 Trạng thái:</strong></td><td><span style="background: #d1fae5; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-weight: 600;">ĐÃ THANH TOÁN</span></td></tr>
            </table>
          </div>

          <div style="${styles.cardInfo}">
            <p style="margin: 0 0 8px 0;"><strong>📝 Lưu ý:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Mình sẽ gửi link meeting trước giờ hẹn 15 phút</li>
              <li>Nếu cần đổi lịch, vui lòng thông báo trước 24h</li>
              <li>Chuẩn bị sẵn câu hỏi để tận dụng tốt thời gian</li>
            </ul>
          </div>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // Payment confirmed - sent to admin
  adminPaymentConfirmed: {
    subject: `💰 Thanh toán xác nhận: ${data.name} - ${
      data.amount ? data.amount.toLocaleString("vi-VN") + "đ" : ""
    }`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">💰 Thanh Toán Đã Xác Nhận!</h1>
        </div>
        <div style="${styles.body}">
          <div style="${styles.cardSuccess}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>👤 Khách hàng:</strong></td><td>${
                data.name
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📧 Email:</strong></td><td><a href="mailto:${
                data.email
              }">${data.email}</a></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📆 Ngày:</strong></td><td><strong>${
                data.date
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>⏰ Giờ:</strong></td><td><strong>${
                data.time
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📋 Loại:</strong></td><td>${
                data.type || "Tư vấn"
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>💰 Số tiền:</strong></td><td><strong style="color: #16a34a;">${
                data.amount ? data.amount.toLocaleString("vi-VN") + "đ" : "Miễn phí"
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>💳 Trạng thái:</strong></td><td><span style="background: #d1fae5; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-weight: 600;">✅ ĐÃ THANH TOÁN</span></td></tr>
            </table>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 13px;">Thanh toán được xác nhận tự động qua Casso</p>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">Long Sang CRM</p>
        </div>
      </div>
    `,
  },

  // Subscription confirmed - sent to client
  subscriptionConfirmed: {
    subject: `🎉 Gói ${data.planName} đã kích hoạt thành công!`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">🎉 Chào mừng bạn!</h1>
          <p style="${styles.headerSubtitle}">Gói ${data.planName} đã được kích hoạt</p>
        </div>
        <div style="${styles.body}">
          <p>Chào <strong>${data.userName}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký! Thanh toán đã được xác nhận và gói dịch vụ của bạn đã được kích hoạt.</p>

          <div style="${styles.cardSuccess}">
            <p style="${styles.label}">THÔNG TIN GÓI DỊCH VỤ</p>
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>📦 Gói:</strong></td><td><strong style="color: #2563eb;">${data.planName}</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>💰 Số tiền:</strong></td><td>${data.amount}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📅 Hết hạn:</strong></td><td>${data.expiresAt}</td></tr>
              <tr><td style="padding: 8px 0;"><strong>💳 Trạng thái:</strong></td><td><span style="background: #d1fae5; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-weight: 600;">✅ ĐÃ KÍCH HOẠT</span></td></tr>
            </table>
          </div>

          <div style="${styles.cardInfo}">
            <p style="margin: 0 0 8px 0;"><strong>🚀 Bắt đầu sử dụng ngay:</strong></p>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Truy cập tất cả tính năng Premium</li>
              <li>Ưu tiên hỗ trợ khi cần thiết</li>
              <li>Cập nhật mới nhất tự động</li>
            </ul>
          </div>

          <p style="text-align: center;">
            <a href="https://longsang.org/my-subscription" style="${styles.buttonSuccess}">📋 Xem gói của tôi</a>
          </p>

          <div style="${styles.signature}">
            <p style="margin: 0;"><strong>Sang</strong></p>
            <p style="color: #64748b; margin: 4px 0 0 0;">Founder - Long Sang AI Solutions</p>
          </div>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">📧 hello@longsang.org | 🌐 longsang.org</p>
        </div>
      </div>
    `,
  },

  // Subscription confirmed - sent to admin
  adminSubscriptionConfirmed: {
    subject: `💎 Subscription mới: ${data.userName} - Gói ${data.planName} (${data.amount})`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">💎 Subscription Mới!</h1>
        </div>
        <div style="${styles.body}">
          <div style="${styles.cardSuccess}">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0;"><strong>👤 Khách hàng:</strong></td><td>${
                data.userName
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>📧 Email:</strong></td><td><a href="mailto:${
                data.userEmail
              }">${data.userEmail}</a></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📦 Gói:</strong></td><td><strong style="color: #2563eb;">${
                data.planName
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>💰 Số tiền:</strong></td><td><strong style="color: #16a34a;">${
                data.amount
              }</strong></td></tr>
              <tr><td style="padding: 8px 0;"><strong>📅 Hết hạn:</strong></td><td>${
                data.expiresAt
              }</td></tr>
              <tr><td style="padding: 8px 0;"><strong>💳 Trạng thái:</strong></td><td><span style="background: #d1fae5; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-weight: 600;">✅ ĐÃ THANH TOÁN</span></td></tr>
            </table>
          </div>
          <p style="text-align: center; color: #64748b; font-size: 13px;">Thanh toán được xác nhận ${
            data.autoConfirmed ? "tự động qua Casso" : "thủ công"
          }</p>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">Long Sang CRM</p>
        </div>
      </div>
    `,
  },

  // Admin: Daily summary
  adminDailySummary: {
    subject: `📊 Báo cáo ngày ${data.date} - ${data.newLeads || 0} leads mới`,
    html: `
      <div style="${styles.container}">
        <div style="${styles.header}">
          <h1 style="${styles.headerTitle}">📊 Báo Cáo Hàng Ngày</h1>
          <p style="${styles.headerSubtitle}">${data.date}</p>
        </div>
        <div style="${styles.body}">
          <div style="display: flex; gap: 16px; margin-bottom: 20px;">
            <div style="flex: 1; background: #f0f9ff; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">LEADS MỚI</p>
              <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: bold; color: #2563eb;">${
                data.newLeads || 0
              }</p>
            </div>
            <div style="flex: 1; background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">ĐÃ CHUYỂN ĐỔI</p>
              <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: bold; color: #16a34a;">${
                data.converted || 0
              }</p>
            </div>
            <div style="flex: 1; background: #fffbeb; padding: 16px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">LỊCH HẸN</p>
              <p style="margin: 8px 0 0 0; font-size: 32px; font-weight: bold; color: #f59e0b;">${
                data.consultations || 0
              }</p>
            </div>
          </div>

          ${
            data.topLeads
              ? `
          <div style="${styles.card}">
            <p style="${styles.label}">🔥 HOT LEADS</p>
            <p style="margin: 0; line-height: 1.6;">${data.topLeads}</p>
          </div>
          `
              : ""
          }

          <p style="text-align: center;">
            <a href="https://longsang.org/admin/simple" style="${styles.button}">📋 Xem chi tiết</a>
          </p>
        </div>
        <div style="${styles.footer}">
          <p style="${styles.footerText}">Long Sang CRM - Auto Report</p>
        </div>
      </div>
    `,
  },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, template, data } = await req.json();

    const templates = getTemplates(data || {});
    const emailTemplate = templates[template as keyof typeof templates];

    if (!emailTemplate) {
      return new Response(
        JSON.stringify({
          error: "Invalid template",
          availableTemplates: Object.keys(templates),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await resend.emails.send({
      from: "Sang <hello@longsang.org>",
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
