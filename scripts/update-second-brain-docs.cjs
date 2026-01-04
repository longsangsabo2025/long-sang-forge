/**
 * Update Second Brain docs để chi tiết hơn về nền tảng LongSang
 */

const config = require("./_config.cjs");

const NEW_CONTENT = `# Second Brain trên LongSang - Hướng dẫn sử dụng

## Second Brain trên LongSang là gì?
Second Brain là tính năng ĐẶC BIỆT của nền tảng LongSang.vn cho phép bạn tạo bộ não thứ hai riêng. KHÔNG cần dùng Notion, Evernote hay công cụ khác - tất cả đã tích hợp sẵn trên LongSang.

## Cách tạo Second Brain trên LongSang:

### Bước 1: Đăng nhập
- Truy cập longsang.vn và đăng nhập tài khoản
- Nếu chưa có tài khoản, đăng ký miễn phí

### Bước 2: Vào trang My Brain
- Click menu "My Brain" hoặc truy cập /my-brain
- Đây là workspace cá nhân của bạn trên LongSang

### Bước 3: Import kiến thức
- Click nút "Import" trên giao diện
- Chọn loại nguồn: URL, YouTube (Pro), hoặc PDF (Pro)
- Paste link hoặc upload file
- Hệ thống LongSang tự động xử lý và lưu vào brain của bạn

### Bước 4: Chat với Brain
- Gõ câu hỏi vào ô chat trên trang /my-brain
- AI của LongSang tìm kiếm trong kiến thức đã lưu
- Nhận câu trả lời dựa trên kiến thức của BẠN

## Tính năng Second Brain trên LongSang:
1. **Import URL** - Paste link bất kỳ, AI tự động lấy nội dung
2. **Import YouTube** (Pro) - Lấy transcript video tự động
3. **Import PDF** (Pro) - Upload PDF, AI đọc và lưu
4. **Brain Chat** - Chat với kiến thức, AI tìm context phù hợp
5. **Vector Search** - Tìm kiếm ngữ nghĩa thông minh
6. **Knowledge Domains** - Phân loại kiến thức theo lĩnh vực

## Gói dịch vụ Second Brain trên LongSang:
- **Free**: 50 documents, 100 queries/tháng - Phù hợp để thử nghiệm
- **Pro 199,000đ/tháng**: 500 docs, import YouTube, PDF - Cho cá nhân
- **Team 499,000đ/tháng**: 2000 docs, team sharing - Cho nhóm/doanh nghiệp

## URL truy cập trên LongSang:
- longsang.vn/my-brain - Trang quản lý brain cá nhân
- longsang.vn/brain/pricing - Xem bảng giá và nâng cấp

## Lưu ý quan trọng:
- Đây là tính năng RIÊNG của LongSang, không cần cài đặt thêm
- Không cần Notion, Evernote, hay công cụ bên ngoài
- Dữ liệu được lưu trữ an toàn trên cloud của LongSang
- Có thể truy cập từ bất kỳ đâu, chỉ cần đăng nhập

## So sánh với các công cụ khác:
| Tính năng | LongSang Second Brain | Notion | Evernote |
|-----------|----------------------|--------|----------|
| AI Chat | ✅ Có sẵn | ❌ Cần thêm | ❌ Cần thêm |
| Import YouTube | ✅ Tự động | ❌ Không | ❌ Không |
| Vector Search | ✅ Có | ❌ Không | ❌ Không |
| Giá | Từ 0đ | Từ $10/tháng | Từ $8/tháng |
| Tiếng Việt | ✅ 100% | 🔸 Một phần | 🔸 Một phần |`;

async function updateDocs() {
  console.log("🚀 Updating Second Brain docs...\n");

  const supabase = config.getSupabaseClient();

  // Update existing product doc
  const { error: err1 } = await supabase
    .from("knowledge_base")
    .update({ content: NEW_CONTENT })
    .eq("category", "product")
    .ilike("title", "%second brain%");

  if (err1) {
    console.log("❌ Error updating product doc:", err1.message);
  } else {
    console.log("✅ Updated product doc");
  }

  // Also update feature-user doc with same detailed content
  const { error: err2 } = await supabase
    .from("knowledge_base")
    .update({ content: NEW_CONTENT })
    .eq("category", "feature-user")
    .eq("subcategory", "second-brain")
    .eq("title", "Second Brain - Bộ Não Thứ Hai Của Bạn");

  if (err2) {
    console.log("❌ Error updating feature-user doc:", err2.message);
  } else {
    console.log("✅ Updated feature-user doc");
  }

  console.log("\n✅ Done! Second Brain docs now focus on LongSang platform.");
}

updateDocs().catch(console.error);
