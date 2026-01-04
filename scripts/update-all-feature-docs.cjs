/**
 * Update all feature-user docs to focus on LongSang platform
 */

const config = require("./_config.cjs");

const UPDATES = [
  {
    title: "Second Brain - Import URL",
    content: `# Cách Import từ URL trên LongSang

## Tính năng Import URL trên LongSang là gì?
Đây là tính năng của Second Brain trên nền tảng LongSang.vn cho phép bạn lưu nội dung từ bất kỳ trang web nào chỉ bằng cách paste đường link.

## Hướng dẫn sử dụng trên LongSang:
1. Đăng nhập vào longsang.vn
2. Vào trang /my-brain (My Brain)
3. Click nút "Import" trên giao diện
4. Chọn tab "URL"
5. Paste đường link cần lưu
6. Click "Import"
7. Hệ thống LongSang tự động lấy nội dung và lưu vào brain của bạn

## Các loại trang web hỗ trợ:
- Bài viết blog, tin tức
- Wikipedia, Medium
- Documentation
- Bất kỳ trang có text content

## Giới hạn theo gói LongSang:
- Free: 50 documents
- Pro 199,000đ/tháng: 500 documents
- Team 499,000đ/tháng: 2000 documents

## Lưu ý:
- Nội dung được tự động chia nhỏ (chunk) để search hiệu quả
- Có thể đặt tiêu đề tùy chỉnh cho document
- Tất cả xử lý trên cloud LongSang, không cần cài đặt gì thêm`,
  },
  {
    title: "Second Brain - Import YouTube",
    content: `# Cách Import YouTube trên LongSang (Pro)

## Tính năng Import YouTube trên LongSang là gì?
Đây là tính năng PRO của Second Brain trên nền tảng LongSang.vn cho phép bạn tự động lấy transcript (phụ đề) từ video YouTube.

## Yêu cầu:
- Gói Pro (199,000đ/tháng) hoặc Team (499,000đ/tháng) trên LongSang
- Video YouTube phải có phụ đề (auto hoặc manual)

## Hướng dẫn sử dụng trên LongSang:
1. Đăng nhập vào longsang.vn với tài khoản Pro/Team
2. Vào trang /my-brain
3. Click nút "Import"
4. Chọn tab "YouTube"
5. Paste link video YouTube
6. Click "Import"
7. LongSang tự động lấy transcript và lưu

## Lợi ích:
- Không cần xem lại video để tìm thông tin
- Dễ dàng tìm kiếm nội dung trong nhiều video
- Tóm tắt video dài bằng cách chat với AI LongSang

## Ví dụ sử dụng:
- Lưu video tutorial học lập trình
- Lưu bài giảng online, webinar
- Lưu podcast trên YouTube

## Nâng cấp lên Pro:
- Vào longsang.vn/brain/pricing
- Chọn gói Pro hoặc Team
- Thanh toán và sử dụng ngay`,
  },
  {
    title: "Second Brain - Brain Chat",
    content: `# Brain Chat trên LongSang - Chat với Kiến Thức

## Brain Chat trên LongSang là gì?
Đây là tính năng chat AI của Second Brain trên nền tảng LongSang.vn. Bạn có thể chat để hỏi đáp dựa trên kiến thức đã lưu trong brain của mình.

## Cách hoạt động trên LongSang:
1. Bạn gõ câu hỏi vào ô chat trên trang /my-brain
2. AI LongSang tìm kiếm trong kiến thức bạn đã import
3. AI trả lời dựa trên context tìm được
4. Hiển thị nguồn tham khảo từ documents của bạn

## Ví dụ câu hỏi có thể hỏi:
- "Tóm tắt những gì tôi đã học về React"
- "Video nào nói về productivity?"
- "Tìm thông tin về marketing trong các bài tôi đã lưu"
- "So sánh các phương pháp trong các tài liệu của tôi"

## Giới hạn queries theo gói LongSang:
- Free: 100 queries/tháng
- Pro 199,000đ/tháng: 1,000 queries/tháng
- Team 499,000đ/tháng: 5,000 queries/tháng

## Tips sử dụng:
- Hỏi cụ thể để có câu trả lời chính xác
- Có thể yêu cầu tóm tắt nhiều sources
- Xem nguồn tham khảo để đọc chi tiết

## URL truy cập:
longsang.vn/my-brain`,
  },
  {
    title: "Second Brain - Bảng Giá",
    content: `# Bảng Giá Second Brain trên LongSang

## Các gói dịch vụ Second Brain của LongSang:

### 1. Gói Miễn Phí (Free)
- **50 documents** - Lưu tối đa 50 tài liệu
- **100 queries/tháng** - 100 lượt chat AI mỗi tháng
- **Import URL** - Lưu từ đường link web
- Phù hợp cho người mới muốn thử nghiệm

### 2. Gói Pro - 199,000đ/tháng
- **500 documents** - Lưu tối đa 500 tài liệu
- **1,000 queries/tháng** - 1000 lượt chat AI
- **Import YouTube** - Tự động lấy transcript video
- **Import PDF** - Upload và đọc file PDF
- Phù hợp cho cá nhân học tập, làm việc

### 3. Gói Team - 499,000đ/tháng
- **2,000 documents** - Lưu tối đa 2000 tài liệu
- **5,000 queries/tháng** - 5000 lượt chat AI
- **Tất cả tính năng Pro**
- **Team sharing** - Chia sẻ kiến thức trong team
- Phù hợp cho nhóm làm việc, doanh nghiệp nhỏ

## Cách đăng ký/nâng cấp trên LongSang:
1. Truy cập longsang.vn/brain/pricing
2. Chọn gói phù hợp
3. Thanh toán qua chuyển khoản ngân hàng hoặc Stripe
4. Tài khoản được nâng cấp ngay lập tức

## Phương thức thanh toán:
- Chuyển khoản ngân hàng (VietQR)
- Visa/Mastercard qua Stripe
- Apple Pay, Google Pay`,
  },
  {
    title: "AI Marketplace - Mua Sản Phẩm AI",
    content: `# AI Marketplace trên LongSang

## AI Marketplace của LongSang là gì?
Đây là nơi bạn có thể mua các sản phẩm AI, tools, templates và khóa học do LongSang cung cấp. Truy cập tại longsang.vn/products

## Các sản phẩm có bán trên LongSang:
1. **AI Tools** - Công cụ AI cho doanh nghiệp
2. **Templates** - Mẫu website, automation workflow
3. **Courses** - Khóa học AI, ChatGPT
4. **Prompts** - Prompt templates chuyên nghiệp
5. **Integrations** - Giải pháp tích hợp AI

## Cách mua sản phẩm trên LongSang:
1. Vào trang longsang.vn/products
2. Chọn sản phẩm cần mua
3. Click "Mua ngay"
4. Thanh toán qua ngân hàng hoặc Stripe
5. Download hoặc access ngay sau khi thanh toán

## Phương thức thanh toán:
- **Chuyển khoản ngân hàng** - Quét QR VietQR
- **Stripe** - Visa, Mastercard, Apple Pay

## URL truy cập:
- longsang.vn/products - Xem tất cả sản phẩm
- longsang.vn/products/[slug] - Chi tiết sản phẩm`,
  },
  {
    title: "AI Academy - Học AI Online",
    content: `# AI Academy trên LongSang

## AI Academy của LongSang là gì?
Đây là nền tảng học AI trực tuyến của LongSang với các khóa học từ cơ bản đến nâng cao. Truy cập tại longsang.vn/academy

## Các khóa học AI trên LongSang Academy:
1. **AI cho Doanh nghiệp** - Ứng dụng AI vào kinh doanh
2. **Automation với AI** - Tự động hóa công việc
3. **Prompt Engineering** - Viết prompt hiệu quả
4. **ChatGPT Mastery** - Sử dụng ChatGPT chuyên nghiệp
5. **AI Marketing** - AI trong digital marketing

## Tính năng LongSang Academy:
- Video bài giảng HD
- Bài tập thực hành
- Certificate sau khi hoàn thành
- Community hỗ trợ
- Lifetime access

## Learning Paths:
- Beginner → Intermediate → Advanced
- Theo lộ trình được thiết kế bởi chuyên gia LongSang

## URL truy cập:
- longsang.vn/academy - Trang chủ Academy
- longsang.vn/academy/courses - Danh sách khóa học`,
  },
  {
    title: "AI Sales Consultant - Tư Vấn 24/7",
    content: `# AI Sales Consultant trên LongSang

## AI Sales Consultant của LongSang là gì?
Đây là chatbot AI tư vấn 24/7 trên nền tảng LongSang.vn. Bạn có thể hỏi bất cứ điều gì về dịch vụ, sản phẩm và nhận tư vấn ngay lập tức.

## Có thể hỏi AI LongSang về:
1. **Dịch vụ** - Thiết kế website, AI automation
2. **Giá cả** - Bảng giá các dịch vụ
3. **Second Brain** - Tính năng brain, cách sử dụng
4. **Academy** - Các khóa học AI
5. **Portfolio** - Dự án đã làm

## Cách sử dụng trên LongSang:
- Click icon chat ở góc phải màn hình trên longsang.vn
- Hoặc truy cập trang chat trực tiếp
- Gõ câu hỏi và nhận câu trả lời ngay

## Tính năng:
- Trả lời tức thì 24/7
- Hiểu tiếng Việt tự nhiên
- Gợi ý câu hỏi liên quan
- Có thể đặt lịch tư vấn với chuyên gia

## Khi nào nên dùng:
- Muốn tìm hiểu nhanh về dịch vụ LongSang
- Cần báo giá sơ bộ
- Có thắc mắc về tính năng
- Muốn đặt lịch tư vấn với người thật`,
  },
  {
    title: "Đặt Lịch Tư Vấn Miễn Phí",
    content: `# Đặt Lịch Tư Vấn Miễn Phí với LongSang

## Tư vấn miễn phí của LongSang là gì?
Đây là buổi gặp 30 phút với chuyên gia LongSang để thảo luận về dự án, nhu cầu và giải pháp phù hợp. HOÀN TOÀN MIỄN PHÍ.

## Nội dung tư vấn:
1. **Phân tích nhu cầu** - Hiểu rõ yêu cầu dự án của bạn
2. **Đề xuất giải pháp** - Giải pháp công nghệ phù hợp
3. **Báo giá sơ bộ** - Ước tính chi phí
4. **Timeline** - Thời gian thực hiện
5. **Q&A** - Giải đáp mọi thắc mắc

## Cách đặt lịch trên LongSang:
1. Truy cập trang đặt lịch trên longsang.vn
2. Chọn ngày giờ phù hợp
3. Điền thông tin liên hệ
4. Nhận email xác nhận
5. Tham gia qua Google Meet/Zoom

## Thời gian tư vấn:
- Thứ 2 - Thứ 6
- 9:00 - 17:00 (giờ Việt Nam)
- 30 phút/buổi

## Lưu ý:
- Hoàn toàn miễn phí, không cam kết
- Có thể đổi lịch nếu cần
- Tư vấn trực tiếp với chuyên gia LongSang`,
  },
  {
    title: "Documentation - Tài Liệu Hướng Dẫn",
    content: `# Documentation trên LongSang

## Documentation của LongSang là gì?
Đây là kho tài liệu hướng dẫn sử dụng các sản phẩm, dịch vụ của LongSang. Truy cập tại longsang.vn/docs

## Các category tài liệu trên LongSang:
1. **Getting Started** - Bắt đầu sử dụng LongSang
2. **Second Brain Guide** - Hướng dẫn dùng Second Brain
3. **API Reference** - Tài liệu API cho developer
4. **Best Practices** - Thực hành tốt nhất
5. **FAQ** - Câu hỏi thường gặp

## Tính năng Documentation:
- Tìm kiếm nhanh
- Tiếng Việt & English
- Copy code snippets
- Dark mode

## URL truy cập:
- longsang.vn/docs - Trang documentation chính`,
  },
  {
    title: "Blog - Bài Viết Công Nghệ & AI",
    content: `# Blog LongSang

## Blog của LongSang là gì?
Nơi chia sẻ kiến thức, tips, và cập nhật mới nhất về AI, công nghệ từ team LongSang. Truy cập tại longsang.vn/blog

## Chủ đề bài viết trên LongSang Blog:
1. **AI & Machine Learning** - Công nghệ AI mới
2. **Automation** - Tự động hóa công việc
3. **Productivity** - Năng suất làm việc
4. **Business** - Kinh doanh với AI
5. **Tutorial** - Hướng dẫn thực hành
6. **Case Study** - Dự án thực tế của LongSang

## Tính năng:
- Đọc miễn phí
- Chia sẻ lên social media
- Nhận newsletter hàng tuần

## URL truy cập:
- longsang.vn/blog - Trang blog chính`,
  },
  {
    title: "Portfolio - Dự Án Đã Thực Hiện",
    content: `# Portfolio LongSang

## Portfolio của LongSang là gì?
Trang showcase các dự án đã thực hiện bởi LongSang. Xem để hiểu năng lực và chất lượng công việc. Truy cập tại longsang.vn/portfolio

## Các loại dự án LongSang đã làm:
1. **Website Development** - Thiết kế website chuyên nghiệp
2. **E-commerce** - Website thương mại điện tử
3. **AI Integration** - Tích hợp AI vào business
4. **Automation** - Giải pháp tự động hóa
5. **Mobile App** - Ứng dụng mobile
6. **Custom Software** - Phần mềm theo yêu cầu

## Thông tin mỗi dự án:
- Mô tả chi tiết
- Công nghệ sử dụng
- Screenshots & demo
- Kết quả đạt được
- Thời gian thực hiện

## URL truy cập:
- longsang.vn/portfolio - Trang portfolio chính
- longsang.vn/portfolio/[slug] - Chi tiết dự án`,
  },
];

async function updateAllDocs() {
  console.log("🚀 Updating all feature-user docs to focus on LongSang...\n");

  const supabase = config.getSupabaseClient();
  let updated = 0;
  let errors = 0;

  for (const doc of UPDATES) {
    const { error } = await supabase
      .from("knowledge_base")
      .update({ content: doc.content })
      .eq("title", doc.title);

    if (error) {
      console.log(`❌ ${doc.title}: ${error.message}`);
      errors++;
    } else {
      console.log(`✅ ${doc.title}`);
      updated++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`✅ Updated: ${updated}`);
  console.log(`❌ Errors: ${errors}`);
  console.log("=".repeat(50));
}

updateAllDocs().catch(console.error);
