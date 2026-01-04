/**
 * 🏢 PLATFORM KNOWLEDGE IMPORT
 *
 * Chiến lược:
 * 1. STATIC KNOWLEDGE → knowledge_base (embeddings)
 *    - Giới thiệu công ty, tầm nhìn
 *    - Quy trình làm việc
 *    - Case studies
 *    - FAQ cố định
 *
 * 2. DYNAMIC KNOWLEDGE → Lấy từ database tables (real-time)
 *    - Bảng giá: subscription_plans
 *    - Dự án: project_showcase
 *    - Thông tin khác: page_content
 *
 * Script này nạp STATIC knowledge.
 * Dynamic data được AI query trực tiếp từ DB khi cần.
 */

const config = require("./_config.cjs");

// ========== STATIC PLATFORM KNOWLEDGE ==========
const PLATFORM_KNOWLEDGE = [
  // ============ GIỚI THIỆU CÔNG TY ============
  {
    title: "Long Sang Tech - Giới thiệu công ty",
    category: "company",
    content: `
# Long Sang Tech - Công ty Công nghệ & Giải pháp AI

## Tổng quan
Long Sang Tech là công ty công nghệ chuyên cung cấp giải pháp phát triển phần mềm, thiết kế web/app, và tích hợp AI cho doanh nghiệp Việt Nam.

## Tầm nhìn
Trở thành đối tác công nghệ đáng tin cậy nhất cho các doanh nghiệp Việt Nam trong hành trình chuyển đổi số và ứng dụng AI.

## Sứ mệnh
- Democratize AI cho mọi doanh nghiệp
- Cung cấp giải pháp công nghệ chất lượng với giá hợp lý
- Đào tạo và nâng cao năng lực số cho cộng đồng

## Giá trị cốt lõi
1. **Chất lượng trên hết**: Mỗi dự án được làm như sản phẩm của chính mình
2. **Minh bạch**: Báo giá rõ ràng, timeline thực tế, không phí ẩn
3. **Đổi mới**: Luôn cập nhật công nghệ mới nhất
4. **Đồng hành**: Hỗ trợ khách hàng sau bàn giao

## Đội ngũ
- Founder & CEO: Long Sang - 10+ năm kinh nghiệm development
- Đội ngũ developers và designers chuyên nghiệp
- Chuyên gia tư vấn AI và automation

## Địa chỉ & Liên hệ
- Website: https://longsang.net
- Email: contact@longsang.net
- Hotline: Liên hệ qua chatbot hoặc form trên website
- Làm việc: Thứ 2 - Thứ 7, 9:00 - 18:00
    `,
  },

  // ============ DỊCH VỤ ============
  {
    title: "Long Sang Tech - Danh sách dịch vụ",
    category: "services",
    content: `
# Dịch vụ của Long Sang Tech

## 1. Thiết kế & Phát triển Website
- **Landing Page**: Website giới thiệu 1 trang, tối ưu SEO
- **Website doanh nghiệp**: Đầy đủ tính năng, nhiều trang
- **E-commerce**: Website bán hàng với thanh toán online
- **Web Application**: Ứng dụng web phức tạp, custom features

### Công nghệ sử dụng
- React, Next.js, Vue.js
- TailwindCSS, Framer Motion
- Node.js, Express
- PostgreSQL, Supabase

## 2. Phát triển Mobile App
- **React Native**: Cross-platform iOS & Android
- **Flutter**: UI đẹp, performance cao
- **Native**: Swift (iOS), Kotlin (Android)

## 3. Giải pháp AI & Automation
- **AI Chatbot**: Tư vấn tự động 24/7
- **Automation workflows**: Tự động hóa quy trình
- **AI Integration**: Tích hợp ChatGPT, Claude vào hệ thống
- **Second Brain**: Hệ thống quản lý tri thức AI

## 4. Phần mềm quản lý (ERP/CRM)
- **ERP tùy chỉnh**: Quản lý doanh nghiệp toàn diện
- **CRM**: Quản lý khách hàng, sales pipeline
- **POS**: Hệ thống bán hàng tại quầy
- **Inventory**: Quản lý kho, tồn kho

## 5. SEO & Digital Marketing
- Audit SEO website
- Tối ưu on-page, off-page
- Content marketing
- Google Ads, Facebook Ads

## 6. Tư vấn & Đào tạo
- Tư vấn chuyển đổi số
- Đào tạo AI cho doanh nghiệp
- Workshop công nghệ
    `,
  },

  // ============ QUY TRÌNH LÀM VIỆC ============
  {
    title: "Long Sang Tech - Quy trình làm việc",
    category: "process",
    content: `
# Quy trình làm việc với Long Sang Tech

## Bước 1: Tư vấn miễn phí (1-2 ngày)
- Khách hàng mô tả yêu cầu qua chatbot hoặc form
- Team liên hệ trao đổi chi tiết
- Phân tích nhu cầu, đề xuất giải pháp
- **MIỄN PHÍ** - Không cam kết

## Bước 2: Báo giá & Proposal (2-3 ngày)
- Gửi báo giá chi tiết
- Timeline dự kiến
- Phạm vi công việc (scope)
- Các gói lựa chọn (nếu có)

## Bước 3: Ký hợp đồng
- Thống nhất điều khoản
- Đặt cọc 30-50% (tùy dự án)
- Kick-off project

## Bước 4: Thiết kế & Phát triển
### Phase 1: Design (1-2 tuần)
- Wireframe
- UI/UX Design
- Khách duyệt design

### Phase 2: Development (2-8 tuần tùy quy mô)
- Coding
- Integration
- Testing nội bộ

### Phase 3: Review & Feedback
- Demo cho khách
- Thu thập feedback
- Chỉnh sửa (2 vòng miễn phí)

## Bước 5: Bàn giao
- Deploy lên server/hosting
- Hướng dẫn sử dụng
- Bàn giao source code (nếu có)
- Thanh toán còn lại

## Bước 6: Hỗ trợ sau bàn giao
- 30 ngày hỗ trợ miễn phí
- Sửa bug phát sinh
- Gói bảo trì hàng tháng (tùy chọn)

## Timeline ước tính
| Loại dự án | Thời gian |
|------------|-----------|
| Landing Page | 1-2 tuần |
| Website doanh nghiệp | 2-4 tuần |
| E-commerce | 4-8 tuần |
| Mobile App | 6-12 tuần |
| ERP/CRM | 8-16 tuần |
    `,
  },

  // ============ SECOND BRAIN (SẢN PHẨM CHÍNH) ============
  {
    title: "Second Brain - Hệ thống quản lý tri thức AI",
    category: "product",
    content: `
# Second Brain - Sản phẩm AI của Long Sang Tech

## Second Brain là gì?
Second Brain là hệ thống quản lý tri thức cá nhân/doanh nghiệp được hỗ trợ bởi AI. Bạn có thể import kiến thức từ nhiều nguồn và chat với AI để truy vấn, tổng hợp thông tin.

## Tính năng chính

### 1. Import đa nguồn
- **URL/Website**: Paste link, tự động lấy nội dung
- **YouTube**: Trích xuất transcript từ video
- **PDF**: Upload file PDF
- **Text**: Nhập nội dung trực tiếp

### 2. AI Chat thông minh
- Hỏi đáp với kiến thức đã import
- Tổng hợp từ nhiều nguồn
- Trích dẫn nguồn rõ ràng
- Đề xuất câu hỏi liên quan

### 3. Tổ chức theo Domain
- Phân loại kiến thức theo chủ đề
- Tìm kiếm nhanh
- Quản lý dễ dàng

### 4. Chia sẻ (Team plan)
- Share với đồng đội
- Collaborative learning
- Centralized knowledge

## Đối tượng sử dụng
- **Cá nhân**: Sinh viên, người đi làm muốn học tập hiệu quả
- **Doanh nghiệp**: Xây dựng knowledge base nội bộ
- **Content Creator**: Tổng hợp research cho content

## Pricing
- **Free**: 50 documents, 100 queries/tháng
- **Pro (199k/tháng)**: 500 documents, 1000 queries
- **Team (499k/tháng)**: 2000 documents, 5000 queries, team sharing

## Cách bắt đầu
1. Đăng ký tài khoản tại longsang.net
2. Truy cập "Bộ não AI"
3. Bắt đầu import kiến thức
4. Chat với AI
    `,
  },

  // ============ AI CHATBOT TƯ VẤN ============
  {
    title: "AI Chatbot Tư vấn - Tính năng website Long Sang",
    category: "product",
    content: `
# AI Chatbot Tư vấn trên Long Sang Tech

## Tổng quan
AI Chatbot của Long Sang là trợ lý ảo thông minh, giúp tư vấn khách hàng 24/7 về dịch vụ, báo giá, và hỗ trợ kỹ thuật.

## Khả năng của Chatbot

### 1. Tư vấn dịch vụ
- Giải thích các dịch vụ
- Đề xuất giải pháp phù hợp
- So sánh các gói dịch vụ

### 2. Hỗ trợ báo giá
- Ước tính chi phí sơ bộ
- Giải thích các yếu tố ảnh hưởng giá
- Kết nối với team để báo giá chi tiết

### 3. Trả lời FAQ
- Quy trình làm việc
- Timeline dự án
- Chính sách thanh toán
- Bảo hành, hỗ trợ

### 4. Thu thập thông tin
- Lắng nghe yêu cầu khách
- Ghi nhận thông tin liên hệ
- Chuyển đến team phù hợp

## Công nghệ
- Powered by OpenAI GPT-4
- RAG (Retrieval-Augmented Generation)
- Knowledge base 500+ tài liệu
- Real-time learning

## Lưu ý
- Chatbot tư vấn sơ bộ, giá chính xác cần liên hệ team
- Có thể yêu cầu nói chuyện với người thật
- Hoạt động 24/7, phản hồi nhanh
    `,
  },

  // ============ FAQ ============
  {
    title: "Long Sang Tech - Câu hỏi thường gặp (FAQ)",
    category: "faq",
    content: `
# Câu hỏi thường gặp - Long Sang Tech

## Về dịch vụ

### Q: Giá thiết kế website bao nhiêu?
A: Giá phụ thuộc vào loại website và tính năng:
- Landing page: từ 3-5 triệu
- Website doanh nghiệp: từ 8-15 triệu
- E-commerce: từ 15-30 triệu
- Web application: Báo giá theo dự án
*Để có giá chính xác, vui lòng mô tả yêu cầu chi tiết.*

### Q: Làm website mất bao lâu?
A: Timeline trung bình:
- Landing page: 1-2 tuần
- Website cơ bản: 2-4 tuần
- E-commerce: 4-8 tuần
- Dự án lớn: 2-4 tháng

### Q: Có hỗ trợ sau bàn giao không?
A: Có! 30 ngày hỗ trợ miễn phí sau bàn giao. Sau đó có gói bảo trì hàng tháng từ 500k-2tr tùy quy mô.

### Q: Có làm việc với khách nước ngoài không?
A: Có, chúng tôi có kinh nghiệm làm việc với clients quốc tế. Giao tiếp bằng tiếng Anh.

## Về thanh toán

### Q: Phải đặt cọc bao nhiêu?
A: Thông thường 30-50% giá trị dự án. Thanh toán còn lại khi bàn giao.

### Q: Có chấp nhận trả góp không?
A: Có thể thương lượng với dự án lớn. Liên hệ để trao đổi.

### Q: Thanh toán bằng cách nào?
A: Chuyển khoản ngân hàng, QR Code, hoặc ví điện tử.

## Về kỹ thuật

### Q: Website có responsive không?
A: Tất cả website đều responsive, hiển thị tốt trên mobile, tablet, desktop.

### Q: Có tối ưu SEO không?
A: Có! SEO cơ bản được tích hợp sẵn. SEO nâng cao là dịch vụ riêng.

### Q: Khách có được source code không?
A: Có, sau khi thanh toán đầy đủ. Khách sở hữu hoàn toàn.

### Q: Hosting ở đâu?
A: Khách có thể chọn: Vercel (free), VPS Việt Nam, hoặc cloud (AWS, GCP).
    `,
  },

  // ============ CÔNG NGHỆ & KỸ NĂNG ============
  {
    title: "Long Sang Tech - Tech Stack & Chuyên môn",
    category: "technical",
    content: `
# Tech Stack của Long Sang Tech

## Frontend
| Công nghệ | Mức độ | Dự án tiêu biểu |
|-----------|--------|-----------------|
| React | Expert | Long Sang Forge, Brain AI |
| Next.js | Expert | Vũng Tàu Land, E-commerce |
| Vue.js | Advanced | Admin dashboards |
| TypeScript | Expert | Tất cả dự án mới |
| TailwindCSS | Expert | Tất cả dự án |
| Framer Motion | Advanced | Animations, transitions |

## Backend
| Công nghệ | Mức độ | Use case |
|-----------|--------|----------|
| Node.js | Expert | API, microservices |
| Express | Expert | REST APIs |
| Supabase | Expert | BaaS, PostgreSQL |
| PostgreSQL | Advanced | Database |
| Redis | Intermediate | Caching |

## AI & Automation
| Công nghệ | Mức độ |
|-----------|--------|
| OpenAI GPT-4 | Expert |
| LangChain | Advanced |
| RAG | Advanced |
| n8n | Expert |
| Embeddings | Advanced |

## Mobile
| Công nghệ | Mức độ |
|-----------|--------|
| React Native | Advanced |
| Expo | Advanced |
| Flutter | Intermediate |

## DevOps & Tools
| Công nghệ | Mức độ |
|-----------|--------|
| Git/GitHub | Expert |
| Vercel | Expert |
| Docker | Advanced |
| CI/CD | Advanced |
| Supabase Functions | Expert |

## Design
| Tool | Mức độ |
|------|--------|
| Figma | Advanced |
| Adobe XD | Intermediate |
| Canva | Advanced |
    `,
  },

  // ============ CASE STUDIES ============
  {
    title: "Long Sang Tech - Dự án tiêu biểu",
    category: "portfolio",
    content: `
# Dự án tiêu biểu của Long Sang Tech

## 1. Long Sang Forge (Internal Tool)
- **Loại**: AI-powered development platform
- **Công nghệ**: React, TypeScript, Supabase, OpenAI
- **Tính năng**: Second Brain, AI Chatbot, Admin Dashboard
- **Kết quả**: Tăng productivity 3x

## 2. Vũng Tàu Land
- **Loại**: Real estate platform
- **Công nghệ**: Next.js, Supabase, Google Maps
- **Tính năng**: Listing, search, contact form
- **Khách hàng**: Bất động sản Vũng Tàu

## 3. Sabo Arena
- **Loại**: Sports booking platform
- **Công nghệ**: React, Node.js, PostgreSQL
- **Tính năng**: Booking sân, payment, notifications
- **Kết quả**: 500+ bookings/tháng

## 4. LeAnn Skincare
- **Loại**: E-commerce
- **Công nghệ**: Next.js, Stripe, Supabase
- **Tính năng**: Product catalog, cart, checkout
- **Khách hàng**: Thương hiệu mỹ phẩm

## 5. AI Automation Projects
- **Loại**: n8n workflows
- **Tính năng**: Email automation, data sync, AI processing
- **Khách hàng**: Nhiều SMEs

## Portfolio đầy đủ
Xem tại: https://longsang.net/projects
Hoặc hỏi chatbot về dự án cụ thể.
    `,
  },

  // ============ CHÍNH SÁCH ============
  {
    title: "Long Sang Tech - Chính sách & Điều khoản",
    category: "policy",
    content: `
# Chính sách của Long Sang Tech

## Chính sách thanh toán
- Đặt cọc: 30-50% khi ký hợp đồng
- Thanh toán theo milestone (dự án lớn)
- Thanh toán còn lại khi bàn giao
- Phương thức: Chuyển khoản, QR, ví điện tử

## Chính sách bảo hành
- 30 ngày bảo hành miễn phí sau bàn giao
- Sửa lỗi do team gây ra: Miễn phí
- Thay đổi yêu cầu mới: Báo giá bổ sung
- Gói bảo trì hàng tháng: Tùy chọn

## Chính sách hủy dự án
- Hủy trước khi bắt đầu: Hoàn 100% cọc
- Hủy trong quá trình: Thanh toán phần đã làm
- Bàn giao partial work nếu có

## Chính sách bảo mật
- NDA có thể ký nếu khách yêu cầu
- Không chia sẻ thông tin khách hàng
- Source code thuộc sở hữu khách sau thanh toán

## Chính sách chỉnh sửa
- 2 vòng chỉnh sửa miễn phí trong scope
- Thay đổi ngoài scope: Báo giá thêm
- Chỉnh sửa nhỏ sau bàn giao: Trong gói bảo hành

## Cam kết
- Deadline đúng hẹn (trừ force majeure)
- Chất lượng đạt chuẩn
- Hỗ trợ tận tình
- Giá không đổi so với báo giá (trừ thay đổi scope)
    `,
  },

  // ============ TẠI SAO CHỌN LONG SANG ============
  {
    title: "Tại sao chọn Long Sang Tech?",
    category: "company",
    content: `
# Tại sao chọn Long Sang Tech?

## 1. Chất lượng đảm bảo
- 10+ năm kinh nghiệm của founder
- Đội ngũ developers chuyên nghiệp
- Code sạch, chuẩn best practices
- Testing kỹ trước bàn giao

## 2. Giá cả hợp lý
- Báo giá minh bạch, không phí ẩn
- Giá cạnh tranh với agency lớn
- Nhiều gói lựa chọn phù hợp budget

## 3. Công nghệ hiện đại
- Sử dụng tech stack mới nhất
- AI integration sẵn có
- Performance tối ưu
- Responsive & SEO friendly

## 4. Đồng hành lâu dài
- Hỗ trợ sau bàn giao
- Gói bảo trì linh hoạt
- Upgrade & scale khi cần
- Tư vấn chiến lược tech

## 5. Quy trình chuyên nghiệp
- Tư vấn miễn phí trước khi bắt đầu
- Báo cáo tiến độ định kỳ
- Demo & feedback liên tục
- Bàn giao đầy đủ tài liệu

## 6. Đa dạng dịch vụ
- Từ landing page đến enterprise app
- Web, mobile, AI đều có
- One-stop solution cho doanh nghiệp

## Khách hàng nói gì?
> "Làm việc với Long Sang rất thoải mái, feedback nhanh, sản phẩm chất lượng."

> "Giá hợp lý, timeline đúng hẹn, recommend cho SMEs."

## Bắt đầu ngay
Chat với AI hoặc để lại thông tin, team sẽ liên hệ trong 24h!
    `,
  },
];

async function main() {
  console.log("\n🏢 PLATFORM KNOWLEDGE IMPORT");
  console.log("=".repeat(50));

  const supabase = config.getSupabaseClient();
  const openai = config.getOpenAIClient();
  const userId = config.DEFAULT_USER_ID;

  let imported = 0,
    skipped = 0,
    failed = 0;

  for (let i = 0; i < PLATFORM_KNOWLEDGE.length; i++) {
    const article = PLATFORM_KNOWLEDGE[i];
    console.log(`\n[${i + 1}/${PLATFORM_KNOWLEDGE.length}] ${article.title}`);

    try {
      // Check duplicate
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("title", article.title)
        .single();

      if (existing) {
        console.log("   ⏭️ Already exists, skipping");
        skipped++;
        continue;
      }

      // Generate embedding
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: article.content.substring(0, 8000),
      });
      const embedding = embeddingRes.data[0].embedding;

      // Save to database
      const { error } = await supabase.from("knowledge_base").insert({
        title: article.title,
        content: article.content,
        category: article.category,
        embedding,
        user_id: userId,
        is_public: true,
        source_url: "platform-static",
        metadata: {
          type: "platform-knowledge",
          imported_at: new Date().toISOString(),
          updatable: false, // Static knowledge
        },
      });

      if (error) throw error;

      console.log("   ✅ SAVED!");
      imported++;

      // Rate limit
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.log("   ❌ Error:", err.message);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 FINAL SUMMARY");
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️ Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log("\n💡 DYNAMIC DATA lấy từ database tables:");
  console.log("   - subscription_plans: Bảng giá chi tiết");
  console.log("   - project_showcase: Dự án chi tiết");
  console.log("   - page_content: Nội dung trang");
  console.log("=".repeat(50));
}

main().catch(console.error);
