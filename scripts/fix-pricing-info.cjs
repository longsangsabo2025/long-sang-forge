/**
 * Fix Pricing in Knowledge Base
 * Cập nhật giá đúng: Free / Pro 49K / VIP 99K
 */

const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Content mới với GIÁ ĐÚNG
const DOCS_TO_UPDATE = [
  {
    title: "Second Brain - Bộ Não Thứ Hai Của Bạn",
    content: `# Second Brain / Workspace trên LongSang - Hướng dẫn sử dụng

## Second Brain (hay còn gọi là Workspace) là gì?
Second Brain là tính năng ĐẶC BIỆT của nền tảng LongSang.vn cho phép bạn tạo **workspace kiến thức cá nhân**. Đây là không gian làm việc (workspace) riêng của bạn để lưu trữ, quản lý, và chat với kiến thức.

**Các tên gọi khác:** Workspace, My Brain, Brain, Bộ não thứ hai, Knowledge Workspace, Personal AI Workspace

## Workspace dùng để làm gì?
1. **Lưu trữ kiến thức** - Import từ URL, YouTube, PDF vào workspace
2. **Tổ chức thông tin** - Phân loại theo domain trong workspace
3. **Chat với AI** - AI tìm kiếm trong workspace của bạn để trả lời
4. **Vector Search** - Tìm kiếm ngữ nghĩa thông minh trong workspace

## Cách sử dụng Workspace/Second Brain trên LongSang:

### Bước 1: Đăng nhập LongSang
- Truy cập longsang.vn và đăng nhập tài khoản
- Nếu chưa có, đăng ký miễn phí tại /auth/sign-up

### Bước 2: Vào Workspace (My Brain)
- Click menu "My Brain" hoặc truy cập longsang.vn/my-brain
- Đây là WORKSPACE cá nhân của bạn trên LongSang

### Bước 3: Import kiến thức vào Workspace
- Click nút "Import" trên giao diện workspace
- Chọn loại nguồn: URL, YouTube (Pro/VIP), hoặc PDF (Pro/VIP)
- Paste link hoặc upload file
- Hệ thống LongSang tự động xử lý và lưu vào workspace của bạn

### Bước 4: Chat với Workspace
- Gõ câu hỏi vào ô chat trên trang /my-brain
- AI của LongSang tìm kiếm trong workspace (kiến thức đã lưu)
- Nhận câu trả lời dựa trên kiến thức của BẠN

## Tính năng Workspace trên LongSang:
1. **Import URL** - Paste link bất kỳ vào workspace, AI tự động lấy nội dung
2. **Import YouTube** (Pro/VIP) - Lấy transcript video tự động vào workspace
3. **Import PDF** (Pro/VIP) - Upload PDF, AI đọc và lưu vào workspace
4. **Brain Chat** - Chat với workspace, AI tìm context phù hợp
5. **Vector Search** - Tìm kiếm ngữ nghĩa thông minh trong workspace
6. **Knowledge Domains** - Phân loại kiến thức theo lĩnh vực trong workspace

## Gói dịch vụ Second Brain trên LongSang:
- **Free (Miễn phí)**: Không có Second Brain - Chỉ có 5 chat AI/tháng
- **Pro (49,000đ/tháng)**: 2 brain domains, 100 chat AI/tháng - Cho cá nhân học tập, làm việc
- **VIP (99,000đ/tháng)**: 5 brain domains, chat AI không giới hạn - Cho người dùng chuyên nghiệp

## Link truy cập Workspace:
- Trang chủ: longsang.vn
- Workspace (My Brain): longsang.vn/my-brain
- Đăng ký: longsang.vn/auth/sign-up
- Bảng giá: longsang.vn/pricing

Bạn có thể đăng ký gói Pro chỉ 49K/tháng để sử dụng Second Brain ngay hôm nay!`,
  },
  {
    title: "Second Brain - Bảng Giá",
    content: `# Bảng Giá Second Brain trên LongSang

## Các gói dịch vụ

### 🆓 Gói FREE (Miễn Phí)
- **Giá:** 0đ
- **Second Brain:** Không có
- **Chat AI:** 5 lượt/tháng
- **Xem dự án:** 1 dự án (SABO ARENA)
- **Đặt tư vấn:** 1/tháng
- **Phù hợp:** Người mới muốn trải nghiệm

### ⭐ Gói PRO (49,000đ/tháng)
- **Giá:** 49,000đ/tháng hoặc 490,000đ/năm (tiết kiệm 2 tháng)
- **Second Brain:** 2 domains
- **Chat AI:** 100 lượt/tháng
- **Xem dự án:** 3 dự án
- **Đặt tư vấn:** 5/tháng
- **Cộng đồng Pro:** Có (Discord độc quyền)
- **Truy cập sớm:** 3 ngày
- **Phù hợp:** Cá nhân học tập, làm việc

### 👑 Gói VIP (99,000đ/tháng)
- **Giá:** 99,000đ/tháng hoặc 990,000đ/năm (tiết kiệm 2 tháng)
- **Second Brain:** 5 domains
- **Chat AI:** Không giới hạn
- **Xem dự án:** Không giới hạn
- **Đặt tư vấn:** Không giới hạn
- **Hỗ trợ ưu tiên:** Có (phản hồi 24h)
- **Đầu tư dự án:** Có quyền đầu tư
- **Hỗ trợ 1:1:** 1 buổi/tháng
- **Truy cập sớm:** 7 ngày
- **Phù hợp:** Chuyên gia, doanh nghiệp

## So sánh nhanh:
| Tính năng | Free | Pro 49K | VIP 99K |
|-----------|------|---------|---------|
| Second Brain | ❌ | 2 domains | 5 domains |
| Chat AI | 5/tháng | 100/tháng | Không giới hạn |
| Xem dự án | 1 | 3 | Không giới hạn |
| Import YouTube/PDF | ❌ | ✅ | ✅ |

## Cách đăng ký:
1. Truy cập longsang.vn/pricing
2. Chọn gói phù hợp (Pro hoặc VIP)
3. Thanh toán qua chuyển khoản ngân hàng
4. Gói được kích hoạt ngay sau khi xác nhận

## Liên hệ tư vấn:
- Website: longsang.vn
- Hotline: 0961 167 717
- Email: contact@longsang.vn`,
  },
  {
    title: "Second Brain - Import YouTube",
    content: `# Import YouTube vào Second Brain - Hướng dẫn chi tiết

## Tính năng Import YouTube là gì?
Tính năng cho phép bạn lấy transcript (phụ đề) từ video YouTube và lưu vào Second Brain workspace của bạn trên LongSang. Giúp bạn tìm kiếm thông tin trong video mà không cần xem lại.

## Yêu cầu:
- Gói **Pro (49,000đ/tháng)** hoặc **VIP (99,000đ/tháng)**
- Gói Free không có tính năng này

## Cách sử dụng:

### Bước 1: Đăng nhập
- Truy cập longsang.vn
- Đăng nhập với tài khoản Pro hoặc VIP

### Bước 2: Vào My Brain
- Truy cập longsang.vn/my-brain
- Đây là workspace của bạn

### Bước 3: Import YouTube
- Click nút "Import" trên giao diện
- Chọn tab "YouTube"
- Paste link video YouTube (ví dụ: https://youtube.com/watch?v=...)
- Click "Import"

### Bước 4: Hoàn tất
- LongSang tự động lấy transcript từ video
- Transcript được lưu vào workspace của bạn
- Bạn có thể chat để hỏi về nội dung video

## Lưu ý:
- Video phải có phụ đề (tự động hoặc do người đăng tạo)
- Video riêng tư không thể import
- Mỗi domain có giới hạn số tài liệu

## Nâng cấp để sử dụng:
- Gói Pro: 49,000đ/tháng - 2 brain domains
- Gói VIP: 99,000đ/tháng - 5 brain domains
- Đăng ký tại: longsang.vn/pricing`,
  },
];

async function updateDocs() {
  console.log("🔄 Updating pricing info in knowledge_base...\n");

  let updated = 0;
  let errors = 0;

  for (const doc of DOCS_TO_UPDATE) {
    console.log(`📝 Updating: ${doc.title}`);

    // 1. Update content
    const { error: updateError } = await supabase
      .from("knowledge_base")
      .update({ content: doc.content })
      .eq("title", doc.title);

    if (updateError) {
      console.error(`  ❌ Update error: ${updateError.message}`);
      errors++;
      continue;
    }

    // 2. Regenerate embedding
    try {
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: doc.content,
      });

      const embedding = embeddingRes.data[0]?.embedding;
      if (embedding) {
        await supabase.from("knowledge_base").update({ embedding }).eq("title", doc.title);
        console.log(`  ✅ Updated with new embedding`);
        updated++;
      }
    } catch (err) {
      console.error(`  ❌ Embedding error: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`\n🎉 Done! Pricing now shows: Free / Pro 49K / VIP 99K`);
}

updateDocs().catch(console.error);
