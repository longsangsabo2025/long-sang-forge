/**
 * Import User Features to Knowledge Base
 * Để AI có thể trả lời câu hỏi về tính năng nền tảng
 */

const config = require("./_config.cjs");

const USER_FEATURES = [
  // ==================== SECOND BRAIN ====================
  {
    title: "Second Brain - Bộ Não Thứ Hai Của Bạn",
    content: `# Second Brain - Bộ Não Thứ Hai Của Bạn

## Second Brain là gì?
Second Brain (Bộ Não Thứ Hai) là tính năng giúp bạn lưu trữ và quản lý kiến thức cá nhân. Thay vì phải nhớ mọi thứ, bạn có thể lưu vào Second Brain và chat để tìm lại bất cứ lúc nào.

## Tính năng chính:
1. **Import từ URL** - Paste link bất kỳ, AI tự động lấy nội dung và lưu
2. **Import từ YouTube** (Pro) - Tự động lấy transcript video
3. **Import từ PDF** (Pro) - Upload file PDF, AI đọc và lưu
4. **Brain Chat** - Chat với kiến thức đã lưu, AI tìm context phù hợp

## Cách sử dụng:
1. Đăng nhập vào tài khoản
2. Vào trang /my-brain hoặc /brain
3. Click "Import" để thêm kiến thức
4. Paste URL hoặc upload file
5. Chat để hỏi về kiến thức đã lưu

## Ví dụ sử dụng:
- Lưu bài viết hay để đọc sau
- Lưu transcript video học
- Tạo thư viện kiến thức cá nhân
- Ôn lại kiến thức bằng cách chat

## URL truy cập:
- /my-brain - Trang quản lý brain
- /brain - Trang brain chính
- /brain/pricing - Xem bảng giá`,
    category: "feature-user",
    subcategory: "second-brain",
    tags: ["second brain", "my brain", "kiến thức", "lưu trữ", "import", "chat"],
  },
  {
    title: "Second Brain - Bảng Giá",
    content: `# Second Brain - Bảng Giá

## Gói Miễn Phí (Free)
- **50 documents** - Lưu tối đa 50 tài liệu
- **100 queries/tháng** - 100 lượt chat mỗi tháng
- **Import URL** - Lưu từ đường link
- Phù hợp cho người mới bắt đầu

## Gói Pro - 199,000đ/tháng
- **500 documents** - Lưu tối đa 500 tài liệu
- **1,000 queries/tháng** - 1000 lượt chat
- **Import YouTube** - Lấy transcript video
- **Import PDF** - Upload và đọc PDF
- Phù hợp cho cá nhân học tập, làm việc

## Gói Team - 499,000đ/tháng
- **2,000 documents** - Lưu tối đa 2000 tài liệu
- **5,000 queries/tháng** - 5000 lượt chat
- **Tất cả tính năng Pro**
- **Team sharing** - Chia sẻ kiến thức trong team
- Phù hợp cho nhóm, doanh nghiệp nhỏ

## Cách nâng cấp:
1. Vào /brain/pricing
2. Chọn gói phù hợp
3. Thanh toán qua ngân hàng hoặc Stripe
4. Tài khoản được nâng cấp ngay`,
    category: "feature-user",
    subcategory: "second-brain",
    tags: ["second brain", "pricing", "giá", "gói", "free", "pro", "team"],
  },
  {
    title: "Second Brain - Import URL",
    content: `# Cách Import từ URL

## Import URL là gì?
Tính năng cho phép bạn lưu nội dung từ bất kỳ trang web nào vào Second Brain chỉ bằng cách paste đường link.

## Cách sử dụng:
1. Vào /my-brain
2. Click nút "Import"
3. Chọn "URL"
4. Paste đường link cần lưu
5. Click "Import"
6. AI tự động lấy nội dung và lưu

## Hỗ trợ các loại trang:
- Bài viết blog
- Tin tức
- Wikipedia
- Medium
- Documentation
- Bất kỳ trang web có text

## Lưu ý:
- Một số trang có chống bot có thể không lấy được
- Nội dung được tự động chia nhỏ (chunk) để search hiệu quả
- Có thể đặt tiêu đề tùy chỉnh

## Giới hạn:
- Free: 50 documents
- Pro: 500 documents
- Team: 2000 documents`,
    category: "feature-user",
    subcategory: "second-brain",
    tags: ["import", "url", "link", "website", "lưu", "paste"],
  },
  {
    title: "Second Brain - Import YouTube",
    content: `# Cách Import từ YouTube (Pro)

## Import YouTube là gì?
Tính năng cho phép bạn tự động lấy transcript (phụ đề) từ video YouTube và lưu vào Second Brain.

## Yêu cầu:
- Gói Pro hoặc Team
- Video phải có phụ đề (auto-generated hoặc manual)

## Cách sử dụng:
1. Vào /my-brain
2. Click nút "Import"
3. Chọn "YouTube"
4. Paste link video YouTube
5. Click "Import"
6. AI tự động lấy transcript và lưu

## Lợi ích:
- Không cần xem lại video để tìm thông tin
- Dễ dàng tìm kiếm nội dung trong video
- Tóm tắt video dài bằng cách chat

## Ví dụ:
- Lưu video tutorial
- Lưu bài giảng online
- Lưu podcast trên YouTube
- Lưu video conference đã record

## Lưu ý:
- Video không có phụ đề sẽ không import được
- Một số video có thể bị chặn`,
    category: "feature-user",
    subcategory: "second-brain",
    tags: ["import", "youtube", "video", "transcript", "phụ đề"],
  },
  {
    title: "Second Brain - Brain Chat",
    content: `# Brain Chat - Chat với Kiến Thức

## Brain Chat là gì?
Tính năng cho phép bạn chat với AI để tìm kiếm và hỏi đáp dựa trên kiến thức đã lưu trong Second Brain.

## Cách hoạt động:
1. Bạn đặt câu hỏi
2. AI tìm kiếm trong kiến thức đã lưu
3. AI trả lời dựa trên context tìm được
4. Hiển thị nguồn tham khảo

## Ví dụ câu hỏi:
- "Tóm tắt những gì tôi đã học về React"
- "Video nào nói về productivity?"
- "Bài viết nào về marketing?"
- "Tìm ghi chú về cuộc họp tuần trước"

## Tips sử dụng:
- Hỏi cụ thể để có câu trả lời chính xác
- Có thể yêu cầu tóm tắt
- Có thể yêu cầu so sánh các nguồn
- Xem nguồn tham khảo để đọc chi tiết

## Giới hạn queries:
- Free: 100/tháng
- Pro: 1,000/tháng
- Team: 5,000/tháng`,
    category: "feature-user",
    subcategory: "second-brain",
    tags: ["chat", "brain", "hỏi đáp", "tìm kiếm", "kiến thức"],
  },

  // ==================== AI MARKETPLACE ====================
  {
    title: "AI Marketplace - Mua Sản Phẩm AI",
    content: `# AI Marketplace

## AI Marketplace là gì?
Đây là nơi bạn có thể mua các sản phẩm AI, tools, templates và khóa học do LongSang cung cấp.

## Sản phẩm có bán:
1. **AI Tools** - Công cụ AI cho doanh nghiệp
2. **Templates** - Mẫu website, automation
3. **Courses** - Khóa học AI
4. **Prompts** - Prompt templates chuyên nghiệp
5. **Integrations** - Giải pháp tích hợp AI

## Cách mua:
1. Vào trang /products
2. Chọn sản phẩm cần mua
3. Click "Mua ngay"
4. Thanh toán qua ngân hàng hoặc Stripe
5. Download hoặc access ngay sau khi thanh toán

## Phương thức thanh toán:
- **Chuyển khoản ngân hàng** - QR code VietQR
- **Stripe** - Visa, Mastercard, Apple Pay

## URL truy cập:
- /products - Xem tất cả sản phẩm
- /products/[slug] - Chi tiết sản phẩm`,
    category: "feature-user",
    subcategory: "marketplace",
    tags: ["marketplace", "sản phẩm", "mua", "ai tools", "templates"],
  },

  // ==================== AI ACADEMY ====================
  {
    title: "AI Academy - Học AI Online",
    content: `# AI Academy

## AI Academy là gì?
Nền tảng học AI trực tuyến với các khóa học từ cơ bản đến nâng cao, phù hợp cho doanh nghiệp và cá nhân muốn ứng dụng AI.

## Các khóa học:
1. **AI cho Doanh nghiệp** - Ứng dụng AI vào kinh doanh
2. **Automation với AI** - Tự động hóa công việc
3. **Prompt Engineering** - Viết prompt hiệu quả
4. **ChatGPT Mastery** - Sử dụng ChatGPT chuyên nghiệp
5. **AI Marketing** - AI trong marketing

## Tính năng:
- Video bài giảng HD
- Bài tập thực hành
- Certificate sau khi hoàn thành
- Community hỗ trợ
- Lifetime access

## Learning Paths:
- Beginner → Intermediate → Advanced
- Theo lộ trình được thiết kế sẵn
- Phù hợp với mục tiêu của bạn

## URL truy cập:
- /academy - Trang chủ Academy
- /academy/courses - Danh sách khóa học
- /academy/paths - Learning paths`,
    category: "feature-user",
    subcategory: "academy",
    tags: ["academy", "học", "khóa học", "ai", "training", "certificate"],
  },

  // ==================== DOCUMENTATION ====================
  {
    title: "Documentation - Tài Liệu Hướng Dẫn",
    content: `# Documentation

## Documentation là gì?
Kho tài liệu hướng dẫn sử dụng các sản phẩm, dịch vụ của LongSang. Bao gồm guides, tutorials, best practices.

## Các category tài liệu:
1. **Getting Started** - Bắt đầu sử dụng
2. **User Guide** - Hướng dẫn người dùng
3. **Developer Docs** - Tài liệu cho developer
4. **API Reference** - Tài liệu API
5. **Best Practices** - Thực hành tốt nhất
6. **Tutorials** - Hướng dẫn từng bước
7. **FAQ** - Câu hỏi thường gặp
8. **Troubleshooting** - Xử lý sự cố
9. **Release Notes** - Cập nhật mới
10. **Integrations** - Hướng dẫn tích hợp

## Tính năng:
- Tìm kiếm nhanh
- Multi-language (Tiếng Việt, English)
- Copy code snippets
- Dark mode

## URL truy cập:
- /docs - Trang documentation chính
- /docs/[category] - Theo category
- /docs/[category]/[slug] - Bài viết chi tiết`,
    category: "feature-user",
    subcategory: "docs",
    tags: ["docs", "documentation", "hướng dẫn", "tài liệu", "tutorial"],
  },

  // ==================== BLOG ====================
  {
    title: "Blog - Bài Viết Công Nghệ & AI",
    content: `# Blog

## Blog là gì?
Nơi chia sẻ kiến thức, tips, và cập nhật mới nhất về AI, công nghệ, và kinh nghiệm làm việc.

## Chủ đề bài viết:
1. **AI & Machine Learning** - Công nghệ AI mới
2. **Automation** - Tự động hóa công việc
3. **Productivity** - Năng suất làm việc
4. **Business** - Kinh doanh với AI
5. **Tutorial** - Hướng dẫn thực hành
6. **Case Study** - Nghiên cứu điển hình
7. **News** - Tin tức công nghệ

## Tính năng:
- Đọc miễn phí
- Chia sẻ lên social media
- Bookmark bài viết yêu thích
- Nhận newsletter hàng tuần

## URL truy cập:
- /blog - Trang blog chính
- /blog/[slug] - Bài viết chi tiết`,
    category: "feature-user",
    subcategory: "blog",
    tags: ["blog", "bài viết", "tin tức", "ai", "công nghệ"],
  },

  // ==================== PORTFOLIO ====================
  {
    title: "Portfolio - Dự Án Đã Thực Hiện",
    content: `# Portfolio

## Portfolio là gì?
Trang showcase các dự án đã thực hiện bởi LongSang. Xem để hiểu năng lực và chất lượng công việc.

## Các loại dự án:
1. **Website Development** - Thiết kế website
2. **E-commerce** - Website thương mại điện tử
3. **AI Integration** - Tích hợp AI
4. **Automation** - Giải pháp tự động hóa
5. **Mobile App** - Ứng dụng mobile
6. **Custom Software** - Phần mềm theo yêu cầu

## Thông tin mỗi dự án:
- Mô tả dự án
- Công nghệ sử dụng
- Screenshots
- Kết quả đạt được
- Thời gian thực hiện

## URL truy cập:
- /portfolio - Trang portfolio chính
- /portfolio/[slug] - Chi tiết dự án`,
    category: "feature-user",
    subcategory: "portfolio",
    tags: ["portfolio", "dự án", "showcase", "case study"],
  },

  // ==================== AI CHAT CONSULTANT ====================
  {
    title: "AI Sales Consultant - Tư Vấn 24/7",
    content: `# AI Sales Consultant

## AI Sales Consultant là gì?
Chatbot AI tư vấn 24/7, trả lời mọi câu hỏi về dịch vụ, giá cả, và hỗ trợ đặt lịch tư vấn.

## Có thể hỏi về:
1. **Dịch vụ** - Các dịch vụ LongSang cung cấp
2. **Giá cả** - Bảng giá, khuyến mãi
3. **Quy trình** - Cách làm việc
4. **Portfolio** - Dự án đã làm
5. **Tính năng** - Các tính năng nền tảng
6. **Hỗ trợ** - Giải đáp thắc mắc

## Tính năng:
- Trả lời tức thì 24/7
- Hiểu tiếng Việt tự nhiên
- Gợi ý câu hỏi liên quan
- Đặt lịch tư vấn trực tiếp
- Lưu lịch sử chat

## Cách sử dụng:
- Click icon chat ở góc phải màn hình
- Hoặc vào trang /chat
- Gõ câu hỏi và nhận câu trả lời ngay`,
    category: "feature-user",
    subcategory: "chat",
    tags: ["chat", "tư vấn", "ai", "24/7", "hỗ trợ", "sales"],
  },

  // ==================== CONSULTATION ====================
  {
    title: "Đặt Lịch Tư Vấn Miễn Phí",
    content: `# Đặt Lịch Tư Vấn

## Tư vấn miễn phí là gì?
Buổi gặp 30 phút với chuyên gia LongSang để thảo luận về dự án, nhu cầu, và giải pháp phù hợp.

## Nội dung tư vấn:
1. **Phân tích nhu cầu** - Hiểu rõ yêu cầu dự án
2. **Đề xuất giải pháp** - Giải pháp công nghệ phù hợp
3. **Báo giá sơ bộ** - Ước tính chi phí
4. **Timeline** - Thời gian thực hiện
5. **Q&A** - Giải đáp thắc mắc

## Cách đặt lịch:
1. Vào trang đặt lịch
2. Chọn ngày giờ phù hợp
3. Điền thông tin liên hệ
4. Nhận email xác nhận
5. Tham gia qua Google Meet/Zoom

## Lưu ý:
- Hoàn toàn miễn phí
- Không cam kết sử dụng dịch vụ
- Có thể đổi lịch nếu cần

## Thời gian:
- Thứ 2 - Thứ 6
- 9:00 - 17:00
- Múi giờ Việt Nam (UTC+7)`,
    category: "feature-user",
    subcategory: "consultation",
    tags: ["tư vấn", "đặt lịch", "booking", "miễn phí", "meeting"],
  },
];

async function importUserFeatures() {
  console.log("🚀 Starting import user features...\n");

  const supabase = config.getSupabaseClient();
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const feature of USER_FEATURES) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from("knowledge_base")
        .select("id")
        .eq("title", feature.title)
        .single();

      if (existing) {
        console.log(`⏭️  Skip: ${feature.title} (exists)`);
        skipped++;
        continue;
      }

      // Insert
      const { error } = await supabase.from("knowledge_base").insert({
        title: feature.title,
        content: feature.content,
        category: feature.category,
        subcategory: feature.subcategory,
        tags: feature.tags,
        source: "platform-features",
        is_active: true,
      });

      if (error) throw error;

      console.log(`✅ Imported: ${feature.title}`);
      imported++;

      // Small delay
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      console.error(`❌ Error: ${feature.title}:`, err.message);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 IMPORT COMPLETE");
  console.log("=".repeat(50));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📝 Total: ${USER_FEATURES.length}`);
}

importUserFeatures().catch(console.error);
