/**
 * Brain Knowledge Loader
 * ======================
 * Nạp kiến thức từ nhiều nguồn vào brain_knowledge
 *
 * Run: node scripts/brain-load-knowledge.cjs
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const config = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  DOMAIN_ID: "19561882-d717-4b29-8b0c-02ed8b304c03", // Long Sang Website domain
};

// ===========================================
// KNOWLEDGE DATA - LONG SANG SERVICES
// ===========================================
const LONG_SANG_KNOWLEDGE = [
  // ========== DỊCH VỤ WEBSITE ==========
  {
    title: "Dịch vụ Thiết kế Website - Long Sang",
    content: `# Dịch vụ Thiết kế Website

Long Sang cung cấp dịch vụ thiết kế website chuyên nghiệp:

## Các gói dịch vụ:

### 1. Landing Page (5-10 triệu)
- 1-3 trang
- Responsive mobile
- Form liên hệ
- SEO cơ bản
- Thời gian: 3-5 ngày

### 2. Website Doanh nghiệp (10-20 triệu)
- 5-10 trang
- Quản trị nội dung (CMS)
- Blog tích hợp
- SEO đầy đủ
- Thời gian: 7-14 ngày

### 3. Website E-commerce (20-50 triệu)
- Giỏ hàng, thanh toán online
- Quản lý sản phẩm
- Tích hợp vận chuyển
- Thời gian: 14-30 ngày

### 4. Web App Custom (báo giá riêng)
- Theo yêu cầu cụ thể
- Dashboard, API
- Tích hợp hệ thống

## Công nghệ sử dụng:
- React, Next.js, Vue
- Node.js, Python
- PostgreSQL, Supabase
- Vercel, AWS

## Liên hệ: 0961167717`,
    content_type: "document",
    tags: ["website", "landing-page", "ecommerce", "pricing", "services"],
  },

  // ========== DỊCH VỤ AI ==========
  {
    title: "Dịch vụ AI Chatbot & Automation - Long Sang",
    content: `# Dịch vụ AI Chatbot & Automation

Long Sang cung cấp giải pháp AI cho doanh nghiệp:

## 1. AI Chatbot (10 triệu/tháng)

### Tính năng:
- Tư vấn tự động 24/7
- Trả lời FAQ
- Chốt sales tự động
- Tích hợp website/Zalo/Messenger
- Học từ dữ liệu công ty

### Lợi ích:
- Giảm 70% thời gian CSKH
- Tăng conversion rate
- Không cần nhân viên trực đêm

## 2. AI Automation

### Các giải pháp:
- Tự động hóa email marketing
- AI viết content
- Phân tích data tự động
- Tích hợp CRM

### Giá: Từ 5-20 triệu/tháng tùy quy mô

## 3. Custom AI Solutions

- Fine-tune model riêng
- RAG với knowledge base công ty
- Tích hợp ERP/CRM

## Tech Stack:
- OpenAI GPT-4
- LangChain, Vector DB
- n8n automation
- Custom training

## Liên hệ tư vấn: 0961167717`,
    content_type: "document",
    tags: ["ai", "chatbot", "automation", "pricing", "services"],
  },

  // ========== DỊCH VỤ SEO ==========
  {
    title: "Dịch vụ SEO & Digital Marketing - Long Sang",
    content: `# Dịch vụ SEO & Digital Marketing

Long Sang giúp doanh nghiệp tăng traffic và leads:

## 1. SEO Website (5 triệu/tháng)

### Bao gồm:
- Audit website
- Tối ưu on-page SEO
- Content marketing (4 bài/tháng)
- Link building
- Báo cáo hàng tháng

### Kết quả kỳ vọng:
- Top 10 Google trong 3-6 tháng
- Tăng 100-300% organic traffic

## 2. Google Ads (5 triệu + phí quảng cáo)

- Setup chiến dịch
- Tối ưu CPC
- A/B testing
- Remarketing

## 3. Social Media Marketing

- Quản lý Facebook/Instagram
- Content calendar
- Ads management
- Báo giá: 3-10 triệu/tháng

## Cam kết:
- Không top = không thu phí
- Báo cáo transparent
- Support 24/7

## Liên hệ: 0961167717`,
    content_type: "document",
    tags: ["seo", "marketing", "google-ads", "pricing", "services"],
  },

  // ========== THÔNG TIN CÔNG TY ==========
  {
    title: "Giới thiệu Long Sang - Công ty Công nghệ",
    content: `# Về Long Sang

Long Sang là công ty công nghệ chuyên về:
- Thiết kế & phát triển Website
- Giải pháp AI cho doanh nghiệp
- SEO & Digital Marketing

## Founder: Sang
- 5+ năm kinh nghiệm tech
- Background: Full-stack developer
- Đam mê AI và automation

## Giá trị cốt lõi:
1. **Chất lượng** - Code sạch, hiệu năng cao
2. **Đơn giản** - Giải pháp dễ sử dụng
3. **Hỗ trợ** - Support nhanh chóng

## Khách hàng đã phục vụ:
- Startup, SME
- Doanh nghiệp F&B
- Bất động sản
- Healthcare

## Liên hệ:
- Phone/Zalo: 0961167717
- Email: hi@longsang.org
- Website: longsang.org

## Địa chỉ:
Hồ Chí Minh, Việt Nam`,
    content_type: "document",
    tags: ["about", "company", "founder", "contact"],
  },

  // ========== FAQ ==========
  {
    title: "FAQ - Câu hỏi thường gặp về Long Sang",
    content: `# Câu hỏi thường gặp (FAQ)

## Q: Long Sang có bán thực phẩm không?
A: KHÔNG. Long Sang là công ty CÔNG NGHỆ, chuyên về Website, AI, SEO. Chúng tôi KHÔNG bán sản phẩm vật lý hay thực phẩm.

## Q: Thời gian làm website bao lâu?
A: Tùy quy mô:
- Landing page: 3-5 ngày
- Website doanh nghiệp: 7-14 ngày
- E-commerce: 14-30 ngày

## Q: Có hỗ trợ sau bàn giao không?
A: Có! Miễn phí 3 tháng support. Sau đó có gói maintenance hàng tháng.

## Q: Thanh toán như thế nào?
A:
- 50% khi ký hợp đồng
- 50% khi bàn giao
- Chấp nhận chuyển khoản, QR

## Q: Có làm việc remote không?
A: Có! Tất cả dự án đều có thể làm remote với meeting online.

## Q: Portfolio ở đâu?
A: Xem tại longsang.org/projects

## Q: Liên hệ cách nào nhanh nhất?
A: Gọi/Zalo: 0961167717 hoặc chat trên website

## Q: Có nhận dự án nhỏ không?
A: Có! Từ landing page 5 triệu đến project lớn đều nhận.`,
    content_type: "qa_pair",
    tags: ["faq", "questions", "support"],
  },

  // ========== PROCESS ==========
  {
    title: "Quy trình làm việc tại Long Sang",
    content: `# Quy trình làm việc

## 1. Tư vấn (Miễn phí)
- Gọi/chat để trao đổi yêu cầu
- Phân tích nhu cầu
- Đề xuất giải pháp phù hợp

## 2. Báo giá
- Gửi báo giá chi tiết
- Timeline rõ ràng
- Không phát sinh phí

## 3. Ký hợp đồng
- Hợp đồng rõ ràng
- Đặt cọc 50%

## 4. Triển khai
- Demo design trước
- Feedback và chỉnh sửa
- Development theo sprint

## 5. Testing
- QA kỹ lưỡng
- Client review
- Fix bugs (nếu có)

## 6. Bàn giao
- Deploy lên server
- Training sử dụng
- Thanh toán 50% còn lại

## 7. Hỗ trợ
- 3 tháng support miễn phí
- Hotline/Zalo: 0961167717`,
    content_type: "document",
    tags: ["process", "workflow", "how-we-work"],
  },

  // ========== PRICING TABLE ==========
  {
    title: "Bảng giá dịch vụ Long Sang 2025",
    content: `# Bảng giá dịch vụ Long Sang 2025

## WEBSITE
| Gói | Giá | Thời gian |
|-----|-----|-----------|
| Landing Page | 5-10 triệu | 3-5 ngày |
| Website DN | 10-20 triệu | 7-14 ngày |
| E-commerce | 20-50 triệu | 14-30 ngày |
| Web App | Báo giá | Tùy project |

## AI & AUTOMATION
| Dịch vụ | Giá/tháng |
|---------|-----------|
| AI Chatbot | 10 triệu |
| Automation cơ bản | 5 triệu |
| Custom AI | Báo giá |

## SEO & MARKETING
| Dịch vụ | Giá/tháng |
|---------|-----------|
| SEO tổng thể | 5 triệu |
| Google Ads | 5 triệu + ads |
| Social Media | 3-10 triệu |

## GÓI COMBO (Tiết kiệm 20%)
- Website + SEO: từ 12 triệu/tháng
- Website + AI Chatbot: từ 18 triệu

## CHÍNH SÁCH
- Báo giá không phát sinh
- Hỗ trợ 3 tháng miễn phí
- Maintenance: 1-3 triệu/tháng

Liên hệ báo giá: 0961167717`,
    content_type: "document",
    tags: ["pricing", "price", "cost", "gia", "bao-gia"],
  },

  // ========== TECH STACK ==========
  {
    title: "Công nghệ Long Sang sử dụng",
    content: `# Tech Stack của Long Sang

## Frontend
- React, Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/UI

## Backend
- Node.js, Express
- Python (AI)
- Supabase (BaaS)
- PostgreSQL

## AI/ML
- OpenAI GPT-4
- LangChain
- pgvector (Vector DB)
- RAG architecture

## DevOps
- Vercel, Cloudflare
- GitHub Actions
- Docker

## Tools
- n8n (automation)
- Figma (design)
- Linear (project mgmt)

## Tại sao chọn stack này?
1. **Performance** - Tối ưu tốc độ
2. **Scalable** - Dễ mở rộng
3. **Modern** - Công nghệ mới nhất
4. **Cost-effective** - Tiết kiệm chi phí

Tất cả project đều code từ đầu, KHÔNG dùng template!`,
    content_type: "document",
    tags: ["tech", "technology", "stack", "development"],
  },

  // ========== CASE STUDY ==========
  {
    title: "Case Study - Dự án tiêu biểu Long Sang",
    content: `# Case Studies - Dự án tiêu biểu

## 1. E-commerce F&B
**Khách hàng:** Chuỗi trà sữa 10 chi nhánh
**Giải pháp:**
- Website đặt hàng online
- Tích hợp thanh toán VNPay
- App quản lý đơn

**Kết quả:**
- 150% tăng doanh số online
- Giảm 40% thời gian xử lý đơn

## 2. AI Chatbot BĐS
**Khách hàng:** Sàn bất động sản
**Giải pháp:**
- Chatbot tư vấn 24/7
- Lọc leads tự động
- Đặt lịch xem nhà

**Kết quả:**
- 300 leads/tháng từ bot
- Tiết kiệm 2 nhân viên CSKH

## 3. SEO Healthcare
**Khách hàng:** Phòng khám nha khoa
**Giải pháp:**
- SEO local
- Google My Business
- Content marketing

**Kết quả:**
- Top 3 Google "nha khoa quận 7"
- 200% tăng booking

Xem thêm: longsang.org/projects`,
    content_type: "document",
    tags: ["case-study", "portfolio", "projects", "success"],
  },
];

// ===========================================
// HELPER
// ===========================================
function computeHash(content) {
  return crypto
    .createHash("md5")
    .update(content || "")
    .digest("hex");
}

async function supabaseRest(endpoint, options = {}) {
  const url = `${config.SUPABASE_URL}/rest/v1/${endpoint}`;
  const response = await fetch(url, {
    headers: {
      apikey: config.SUPABASE_KEY,
      Authorization: `Bearer ${config.SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase error: ${response.status} - ${error}`);
  }

  const contentLength = response.headers.get("content-length");
  if (options.method === "DELETE" || contentLength === "0") {
    return null;
  }

  return response.json();
}

// ===========================================
// MAIN
// ===========================================
async function loadKnowledge() {
  console.log("🧠 BRAIN KNOWLEDGE LOADER");
  console.log("=".repeat(50));

  // Check existing knowledge
  const existing = await supabaseRest("brain_knowledge?select=title,id");
  const existingTitles = new Set(existing.map((x) => x.title));

  console.log(`\n📊 Current knowledge: ${existing.length} items`);
  console.log(`📝 New knowledge to load: ${LONG_SANG_KNOWLEDGE.length} items`);

  let added = 0;
  let skipped = 0;

  for (const knowledge of LONG_SANG_KNOWLEDGE) {
    if (existingTitles.has(knowledge.title)) {
      console.log(`⏭️ Skip (exists): ${knowledge.title.substring(0, 40)}...`);
      skipped++;
      continue;
    }

    try {
      await supabaseRest("brain_knowledge", {
        method: "POST",
        body: JSON.stringify({
          domain_id: config.DOMAIN_ID,
          title: knowledge.title,
          content: knowledge.content,
          content_type: knowledge.content_type,
          tags: knowledge.tags,
          metadata: {
            contentHash: computeHash(knowledge.content),
            source: "brain-loader",
            loadedAt: new Date().toISOString(),
          },
          importance_score: 80, // High priority for core knowledge
        }),
      });

      console.log(`✅ Added: ${knowledge.title.substring(0, 40)}...`);
      added++;
    } catch (err) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY:");
  console.log(`   ✅ Added: ${added}`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  console.log(`   📚 Total: ${existing.length + added}`);
  console.log("\n💡 Now run: node scripts/brain-auto-embed.cjs");
  console.log("=".repeat(50));
}

loadKnowledge().catch(console.error);
