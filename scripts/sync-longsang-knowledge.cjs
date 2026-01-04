/**
 * ELON MODE: Sync Long Sang Knowledge to Brain
 * Nạp toàn bộ kiến thức về Long Sang vào AI Brain
 */

const https = require("https");
const config = require("./_config.cjs");

// Validate required keys
config.validate(["SUPABASE_SERVICE_KEY"]);

const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_KEY = config.SUPABASE_SERVICE_KEY;

// Long Sang Domain ID - sẽ tạo hoặc dùng existing
let LONGSANG_DOMAIN_ID = null;

// ==================== KNOWLEDGE BASE ====================

const knowledgeEntries = [
  // 1. TỔNG QUAN VỀ LONG SANG
  {
    title: "Long Sang - Giới Thiệu Tổng Quan",
    content: `
# Long Sang - Software Developer & AI Integration Specialist

## Thông Tin Cơ Bản
- **Tên đầy đủ**: Võ Long Sang
- **Sinh năm**: 1996
- **Vị trí**: TP. Hồ Chí Minh, Việt Nam
- **Website**: longsang.org
- **Ngôn ngữ**: Tiếng Việt (Native), English (IELTS 5.5)

## Thông Tin Liên Hệ
- **Điện thoại**: 0961167717
- **Email**: contact@longsang.org, longsangsabo@gmail.com
- **Facebook**: https://www.facebook.com/longsang791
- **Zalo**: https://zalo.me/0961167717
- **LinkedIn**: https://www.linkedin.com/in/long-sang-75a781357/
- **GitHub**: https://github.com/longsangsabo

## Slogan
"Digital Innovation • AI Automation • Business Growth"

## Tầm nhìn
Xây dựng các giải pháp phần mềm thông minh, tích hợp AI để tự động hóa quy trình và thúc đẩy tăng trưởng kinh doanh cho doanh nghiệp Việt Nam.
    `,
    tags: ["longsang", "about", "contact", "profile"],
  },

  // 2. DỊCH VỤ - PHÁT TRIỂN ỨNG DỤNG MOBILE & DESKTOP
  {
    title: "Dịch Vụ - Phát Triển Ứng Dụng Mobile & Desktop",
    content: `
# Phát Triển Ứng Dụng Mobile & Desktop

## Công Nghệ Sử Dụng
- **Flutter**: Framework chính cho cross-platform
- **Dart**: Ngôn ngữ lập trình
- **Platforms**: iOS, Android, Windows, macOS

## Khả Năng
- Phát triển ứng dụng native-like performance
- Single codebase cho nhiều platforms
- UI/UX hiện đại, responsive
- Tích hợp API, database, push notifications
- Offline-first architecture

## Thành Tích
- 5+ dự án đã triển khai
- 8+ ứng dụng đang hoạt động production
- 200+ người dùng thực tế

## Ứng Dụng Tiêu Biểu
- SABO Arena: Ứng dụng quản lý giải đấu billiards
- Long Sang App: Ứng dụng cá nhân đa năng

## Quy Trình Làm Việc
1. Phân tích yêu cầu & thiết kế prototype
2. Phát triển MVP với core features
3. Testing & optimization
4. Deployment lên App Store/Play Store
5. Bảo trì & cập nhật liên tục
    `,
    tags: ["services", "mobile", "flutter", "app-development"],
  },

  // 3. DỊCH VỤ - PHÁT TRIỂN WEB
  {
    title: "Dịch Vụ - Phát Triển Website & Web App",
    content: `
# Phát Triển Website & Web Application

## Tech Stack
- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL, Firebase

## Loại Dự Án
- Landing pages chuyên nghiệp
- Web applications phức tạp
- Admin dashboards
- E-commerce platforms
- SaaS products

## Thành Tích
- 10+ dự án web đã triển khai
- Website tối ưu SEO, load nhanh
- Responsive trên mọi thiết bị

## Tính Năng Đặc Biệt
- AI Chatbot tích hợp sẵn
- Hệ thống authentication đầy đủ
- Real-time notifications
- Analytics & tracking

## Dự Án Tiêu Biểu
- longsang.org: Website portfolio cá nhân
- Long Sang Admin: Hệ thống quản trị nội dung
- Vũng Tàu Dream Homes: Website bất động sản
    `,
    tags: ["services", "web", "react", "website-development"],
  },

  // 4. DỊCH VỤ - AUTOMATION
  {
    title: "Dịch Vụ - Tự Động Hóa Quy Trình",
    content: `
# Automation & Workflow Optimization

## Công Cụ Sử Dụng
- **Zapier**: No-code automation platform
- **Make (Integromat)**: Advanced automation
- **n8n**: Self-hosted workflow automation
- **Custom APIs**: Tích hợp đa nền tảng

## Khả Năng
- Tự động hóa email marketing
- CRM automation
- Social media scheduling
- Data sync giữa các platforms
- Invoice & payment automation
- Report generation tự động

## Thành Tích
- 20+ workflows đã triển khai
- Tiết kiệm 50+ giờ/tuần cho khách hàng
- ROI tăng 300% sau automation

## Ứng Dụng Thực Tế
- Lead capture tự động từ website → CRM
- Gửi email follow-up tự động
- Sync data giữa Google Sheets, Airtable, Notion
- Thông báo Slack/Telegram khi có đơn hàng mới
    `,
    tags: ["services", "automation", "workflow", "zapier", "n8n"],
  },

  // 5. DỊCH VỤ - AI INTEGRATION
  {
    title: "Dịch Vụ - Tích Hợp AI & Chatbot",
    content: `
# AI Integration & Intelligent Chatbots

## Công Nghệ AI
- **OpenAI**: GPT-4, GPT-3.5, Embeddings
- **Google Gemini**: Gemini Pro, Vision
- **Anthropic Claude**: Claude 3 models
- **LangChain**: AI orchestration framework

## Giải Pháp AI
- AI Chatbots thông minh
- AI Sales Consultant
- AI Customer Support
- AI Content Generation
- AI Document Analysis
- Vector Search & RAG systems

## Thành Tích
- 15+ tích hợp AI đã triển khai
- Chatbot xử lý 1000+ conversations/tháng
- Tỷ lệ hài lòng 90%+

## Tính Năng Chatbot
- Trả lời 24/7 không cần nhân viên
- Học từ knowledge base của doanh nghiệp
- Tích hợp đặt lịch tư vấn
- Hỗ trợ đa ngôn ngữ
- Phân tích sentiment người dùng

## Chi Phí AI
- API costs tối ưu với caching
- Hybrid approach (local + cloud)
- Pay-per-use model linh hoạt
    `,
    tags: ["services", "ai", "chatbot", "openai", "gemini"],
  },

  // 6. KINH NGHIỆM LÀM VIỆC
  {
    title: "Long Sang - Kinh Nghiệm Làm Việc",
    content: `
# Kinh Nghiệm Làm Việc

## 1. Freelance / Dự Án Cá Nhân (2023 - Hiện tại)
**Vị trí**: Full Stack Developer
- Phát triển ứng dụng web với React, TypeScript, Node.js
- Xây dựng giải pháp phần mềm phục vụ vận hành kinh doanh
- Tích hợp API từ OpenAI, Gemini vào sản phẩm thực tế
- Triển khai backend với Supabase và PostgreSQL

## 2. SABO Billiards (04/2023 - Hiện tại)
**Vị trí**: Chủ sở hữu & Quản lý
- Quản lý vận hành câu lạc bộ billiards tại Vũng Tàu
- Phát triển ứng dụng SABO Arena hỗ trợ quản lý giải đấu
- Tổ chức giải đấu định kỳ cho cộng đồng

## 3. PVChem Drilling Mud (07/2022 - 03/2023)
**Vị trí**: Kỹ sư Dung dịch khoan
- Quản lý quy trình kiểm soát chất lượng cho 10+ giàn khoan offshore
- Tối ưu hóa công thức dung dịch giảm 15% chi phí vật liệu

## 4. Posco Vietnam (03/2020 - 04/2022)
**Vị trí**: Kỹ sư - Bộ phận Tiện ích
- Triển khai thành công ISO 9001:2015 & ISO 14001:2015
- Thực hiện 20+ đánh giá nội bộ

## 5. Daikin Vietnam (10/2019 - 02/2020)
**Vị trí**: Kỹ sư Kinh doanh B2B
- Đạt 100% target doanh số trong 3 tháng thử việc
    `,
    tags: ["experience", "career", "work-history"],
  },

  // 7. KỸ NĂNG KỸ THUẬT
  {
    title: "Long Sang - Kỹ Năng Kỹ Thuật",
    content: `
# Kỹ Năng Kỹ Thuật (Hard Skills)

## Frontend Development
- React / Next.js - Expert level
- TypeScript - Expert level
- Tailwind CSS - Expert level
- Flutter / Dart - Intermediate level

## Backend & Database
- Node.js / Express - Expert level
- PostgreSQL / Supabase - Expert level
- REST APIs - Expert level
- Firebase - Intermediate level

## AI & Automation
- OpenAI / Gemini API - Expert level
- Chatbot Development - Expert level
- AI Agents - Intermediate level
- Process Automation - Expert level

## DevOps & Tools
- Git / GitHub - Expert level
- Vercel / Netlify - Expert level
- CI/CD Pipelines - Intermediate level
- Docker Basics - Beginner level

## Languages & Frameworks
- JavaScript/TypeScript: 90%
- Python: 60%
- Dart: 70%
- SQL: 80%
    `,
    tags: ["skills", "technical", "programming"],
  },

  // 8. DỰ ÁN TIÊU BIỂU
  {
    title: "Long Sang - Dự Án Tiêu Biểu",
    content: `
# Dự Án Tiêu Biểu

## 1. SABO Arena - Billiards Tournament Platform
- **Mô tả**: Nền tảng quản lý giải đấu billiards
- **Tech**: Flutter, React, Supabase, PostgreSQL
- **Tính năng**: Quản lý giải đấu, xếp hạng ELO, thách đấu, câu lạc bộ
- **Link**: saboarena.com

## 2. Long Sang Website - Portfolio & Services
- **Mô tả**: Website cá nhân với AI chatbot
- **Tech**: React, TypeScript, Tailwind, Supabase
- **Tính năng**: AI Sales Consultant, đặt lịch tư vấn, showcase projects
- **Link**: longsang.org

## 3. Vũng Tàu Dream Homes - Real Estate Platform
- **Mô tả**: Nền tảng bất động sản Vũng Tàu
- **Tech**: React, Supabase
- **Tính năng**: Listing properties, AI chatbot, investment calculator

## 4. AI Second Brain - Personal Knowledge Management
- **Mô tả**: Hệ thống quản lý kiến thức cá nhân với AI
- **Tech**: React, Vector DB, LangChain
- **Tính năng**: Vector search, auto-learning, domain organization

## 5. Long Sang Admin - Content Management System
- **Mô tả**: Hệ thống quản trị nội dung đa năng
- **Tech**: React, TypeScript, Supabase
- **Tính năng**: CRM, subscription management, analytics
    `,
    tags: ["projects", "portfolio", "showcase"],
  },

  // 9. GIÁ DỊCH VỤ
  {
    title: "Long Sang - Bảng Giá Dịch Vụ",
    content: `
# Bảng Giá Dịch Vụ Tham Khảo

## Website Development
- **Landing Page cơ bản**: 5-10 triệu VNĐ
- **Website doanh nghiệp**: 15-30 triệu VNĐ
- **Web App phức tạp**: 30-100 triệu VNĐ (tùy scope)

## Mobile App Development
- **MVP cơ bản**: 30-50 triệu VNĐ
- **App đầy đủ tính năng**: 50-150 triệu VNĐ

## AI Integration
- **Chatbot cơ bản**: 5-10 triệu VNĐ
- **AI Assistant phức tạp**: 15-40 triệu VNĐ
- **Custom AI solution**: Báo giá theo dự án

## Automation
- **Workflow cơ bản**: 3-5 triệu VNĐ
- **Automation phức tạp**: 10-20 triệu VNĐ

## Subscription Plans (Long Sang Admin)
- **Free**: 0đ/tháng - Trải nghiệm cơ bản
- **Pro**: $15/tháng - Full features
- **Enterprise**: Custom pricing

## Lưu ý
- Giá trên chỉ mang tính tham khảo
- Báo giá cụ thể sau khi phân tích yêu cầu
- Thanh toán linh hoạt: 50% trước, 50% sau
- Hỗ trợ VNPay và Stripe
    `,
    tags: ["pricing", "costs", "services"],
  },

  // 10. CÁCH LONG SANG CÓ THỂ GIÚP
  {
    title: "Long Sang Có Thể Giúp Gì Cho Bạn?",
    content: `
# Long Sang Có Thể Giúp Gì Cho Bạn?

## Nếu bạn là Startup / Doanh nghiệp nhỏ
- Xây dựng MVP nhanh với chi phí tối ưu
- Website chuyên nghiệp thu hút khách hàng
- Chatbot AI thay thế nhân viên tư vấn 24/7
- Tự động hóa quy trình tiết kiệm thời gian

## Nếu bạn là Doanh nghiệp lớn
- Tích hợp AI vào hệ thống hiện có
- Custom software solutions
- Data automation & reporting
- Digital transformation consulting

## Nếu bạn là Cá nhân
- Website portfolio cá nhân
- Ứng dụng mobile cho ý tưởng của bạn
- Công cụ productivity tự động

## Nếu bạn là Investor
- Long Sang Academy: Nền tảng học online AI-powered
- SABO Arena: Ứng dụng thể thao có tiềm năng scale
- SaaS products với recurring revenue

## Quy Trình Hợp Tác
1. **Tư vấn miễn phí**: Chat với AI hoặc đặt lịch gọi
2. **Phân tích yêu cầu**: Hiểu rõ nhu cầu của bạn
3. **Đề xuất giải pháp**: Báo giá & timeline
4. **Phát triển**: Xây dựng với updates thường xuyên
5. **Bàn giao & hỗ trợ**: Training + warranty

## Liên Hệ Ngay
- Chat với AI Consultant trên website
- Đặt lịch tư vấn 1-1
- Điện thoại: 0961167717
- Email: contact@longsang.org
    `,
    tags: ["help", "solutions", "consulting"],
  },

  // 11. CÂU HỎI THƯỜNG GẶP
  {
    title: "Long Sang - Câu Hỏi Thường Gặp (FAQ)",
    content: `
# Câu Hỏi Thường Gặp

## Q: Long Sang làm được những gì?
A: Phát triển website, mobile app, tích hợp AI, và tự động hóa quy trình. Chuyên về React, Flutter, và AI integration.

## Q: Chi phí làm website là bao nhiêu?
A: Tùy thuộc vào độ phức tạp. Landing page từ 5-10 triệu, website doanh nghiệp 15-30 triệu, web app phức tạp 30-100+ triệu.

## Q: Thời gian hoàn thành dự án?
A: Landing page: 1-2 tuần. Website doanh nghiệp: 2-4 tuần. Web/Mobile app: 1-3 tháng tùy scope.

## Q: Có hỗ trợ sau khi bàn giao không?
A: Có, warranty 3-6 tháng miễn phí. Sau đó có gói maintenance hàng tháng.

## Q: Long Sang có team hay làm một mình?
A: Hiện tại làm freelance một mình, nhưng có network partners khi cần scale.

## Q: Thanh toán như thế nào?
A: Thường 50% trước khi bắt đầu, 50% sau khi hoàn thành. Hỗ trợ VNPay, chuyển khoản, Stripe.

## Q: Có thể làm việc remote không?
A: Hoàn toàn có thể. Đã và đang làm việc với khách hàng ở nhiều nơi khác nhau.

## Q: Long Sang có background gì?
A: Kỹ sư Lọc - Hóa dầu (ĐH Bách Khoa), 5+ năm kinh nghiệm kỹ thuật, 2+ năm trong tech/software.
    `,
    tags: ["faq", "questions", "support"],
  },

  // 12. TECH STACK CHI TIẾT
  {
    title: "Long Sang - Tech Stack Chi Tiết",
    content: `
# Tech Stack Chi Tiết

## Frontend
| Technology | Proficiency | Use Cases |
|------------|-------------|-----------|
| React | ⭐⭐⭐⭐⭐ | Web apps, dashboards |
| Next.js | ⭐⭐⭐⭐ | SSR, SEO-optimized sites |
| TypeScript | ⭐⭐⭐⭐⭐ | Type-safe development |
| Tailwind CSS | ⭐⭐⭐⭐⭐ | Rapid UI development |
| Flutter | ⭐⭐⭐⭐ | Cross-platform apps |

## Backend
| Technology | Proficiency | Use Cases |
|------------|-------------|-----------|
| Node.js | ⭐⭐⭐⭐ | APIs, servers |
| Express.js | ⭐⭐⭐⭐ | REST APIs |
| Supabase | ⭐⭐⭐⭐⭐ | BaaS, Auth, Realtime |
| PostgreSQL | ⭐⭐⭐⭐ | Database |
| Firebase | ⭐⭐⭐ | Mobile backend |

## AI & ML
| Technology | Proficiency | Use Cases |
|------------|-------------|-----------|
| OpenAI API | ⭐⭐⭐⭐⭐ | Chatbots, content gen |
| Gemini API | ⭐⭐⭐⭐ | Multimodal AI |
| LangChain | ⭐⭐⭐ | AI orchestration |
| Vector DBs | ⭐⭐⭐⭐ | Semantic search |

## DevOps
| Technology | Proficiency | Use Cases |
|------------|-------------|-----------|
| Git/GitHub | ⭐⭐⭐⭐⭐ | Version control |
| Vercel | ⭐⭐⭐⭐⭐ | Frontend deployment |
| Docker | ⭐⭐⭐ | Containerization |
| CI/CD | ⭐⭐⭐ | Automation |
    `,
    tags: ["tech-stack", "technologies", "skills"],
  },
];

// ==================== HELPER FUNCTIONS ====================

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const result = body ? JSON.parse(body) : null;
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function ensureDomain() {
  console.log("\n📁 Checking Long Sang domain...");

  // Check if domain exists
  const { data: domains } = await makeRequest(
    "GET",
    "/rest/v1/brain_domains?name=eq.Long%20Sang%20Website"
  );

  if (domains && domains.length > 0) {
    LONGSANG_DOMAIN_ID = domains[0].id;
    console.log(`   ✅ Found existing domain: ${LONGSANG_DOMAIN_ID}`);
    return;
  }

  // Create new domain
  const { status, data } = await makeRequest("POST", "/rest/v1/brain_domains", {
    name: "Long Sang Website",
    description:
      "Kiến thức đầy đủ về Long Sang - dịch vụ, kỹ năng, dự án, liên hệ, và cách Long Sang có thể giúp khách hàng",
    knowledge_count: 0,
  });

  if (status === 201 && data && data.length > 0) {
    LONGSANG_DOMAIN_ID = data[0].id;
    console.log(`   ✅ Created new domain: ${LONGSANG_DOMAIN_ID}`);
  } else {
    throw new Error(`Failed to create domain: ${JSON.stringify(data)}`);
  }
}

async function clearOldKnowledge() {
  console.log("\n🧹 Clearing old Long Sang knowledge...");

  const { status } = await makeRequest(
    "DELETE",
    `/rest/v1/brain_knowledge?domain_id=eq.${LONGSANG_DOMAIN_ID}`
  );

  console.log(`   ✅ Cleared (status: ${status})`);
}

async function insertKnowledge(entry, index) {
  const { status, data } = await makeRequest("POST", "/rest/v1/brain_knowledge", {
    domain_id: LONGSANG_DOMAIN_ID,
    title: entry.title,
    content: entry.content.trim(),
    content_type: "document",
    tags: entry.tags,
    source_url: "https://longsang.org",
    importance_score: 80,
  });

  if (status === 201) {
    console.log(`   ✅ [${index + 1}/${knowledgeEntries.length}] ${entry.title}`);
    return true;
  } else {
    console.log(
      `   ❌ [${index + 1}/${knowledgeEntries.length}] ${entry.title} - Error: ${JSON.stringify(
        data
      )}`
    );
    return false;
  }
}

async function updateDomainCount() {
  await makeRequest("PATCH", `/rest/v1/brain_domains?id=eq.${LONGSANG_DOMAIN_ID}`, {
    knowledge_count: knowledgeEntries.length,
  });
}

// ==================== MAIN ====================

async function main() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║   🧠 ELON MODE: Sync Long Sang Knowledge to AI Brain          ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  try {
    // 1. Ensure domain exists
    await ensureDomain();

    // 2. Clear old knowledge
    await clearOldKnowledge();

    // 3. Insert all knowledge entries
    console.log("\n📚 Inserting knowledge entries...");
    let success = 0;
    let failed = 0;

    for (let i = 0; i < knowledgeEntries.length; i++) {
      const result = await insertKnowledge(knowledgeEntries[i], i);
      if (result) success++;
      else failed++;
    }

    // 4. Update domain count
    await updateDomainCount();

    // 5. Summary
    console.log("\n╔════════════════════════════════════════════════════════════════╗");
    console.log("║                         📊 SUMMARY                             ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");
    console.log(`║   ✅ Success: ${success} entries                                      ║`);
    console.log(`║   ❌ Failed: ${failed} entries                                        ║`);
    console.log(`║   📁 Domain: Long Sang Website                                 ║`);
    console.log("╚════════════════════════════════════════════════════════════════╝");

    console.log("\n🚀 AI Brain now has complete Long Sang knowledge!");
    console.log("   Chatbot can now answer:");
    console.log("   • Long Sang làm được gì?");
    console.log("   • Chi phí dịch vụ bao nhiêu?");
    console.log("   • Liên hệ như thế nào?");
    console.log("   • Long Sang có thể giúp gì cho tôi?");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

main();
