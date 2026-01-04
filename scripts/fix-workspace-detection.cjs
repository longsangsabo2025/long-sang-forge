/**
 * Fix Workspace Detection
 * Cập nhật docs để có từ khóa "workspace" và tương tự
 */

const { createClient } = require("@supabase/supabase-js");
const OpenAI = require("openai");
require("dotenv").config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

// Map các từ khóa phổ biến user có thể hỏi -> tên doc cần ưu tiên
const KEYWORD_TO_DOC_ALIASES = {
  // Workspace/Brain aliases
  workspace: "Second Brain",
  "my brain": "Second Brain",
  mybrain: "Second Brain",
  "bộ não": "Second Brain",
  "lưu kiến thức": "Second Brain",
  "quản lý kiến thức": "Second Brain",
  "knowledge management": "Second Brain",

  // Import aliases
  import: "Second Brain - Import",
  upload: "Second Brain - Import",
  "tải lên": "Second Brain - Import",

  // Chat aliases
  "chat với ai": "Brain Chat",
  "hỏi ai": "Brain Chat",

  // Pricing aliases
  giá: "Bảng Giá",
  "bao nhiêu tiền": "Bảng Giá",
  gói: "Bảng Giá",
  pricing: "Bảng Giá",
  pro: "Bảng Giá",
  team: "Bảng Giá",
};

// Content mới cho Second Brain - thêm nhiều từ khóa hơn
const NEW_SECOND_BRAIN_CONTENT = `# Second Brain / Workspace trên LongSang - Hướng dẫn sử dụng

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
- Chọn loại nguồn: URL, YouTube (Pro), hoặc PDF (Pro)
- Paste link hoặc upload file
- Hệ thống LongSang tự động xử lý và lưu vào workspace của bạn

### Bước 4: Chat với Workspace
- Gõ câu hỏi vào ô chat trên trang /my-brain
- AI của LongSang tìm kiếm trong workspace (kiến thức đã lưu)
- Nhận câu trả lời dựa trên kiến thức của BẠN

## Tính năng Workspace trên LongSang:
1. **Import URL** - Paste link bất kỳ vào workspace, AI tự động lấy nội dung
2. **Import YouTube** (Pro) - Lấy transcript video tự động vào workspace
3. **Import PDF** (Pro) - Upload PDF, AI đọc và lưu vào workspace
4. **Brain Chat** - Chat với workspace, AI tìm context phù hợp
5. **Vector Search** - Tìm kiếm ngữ nghĩa thông minh trong workspace
6. **Knowledge Domains** - Phân loại kiến thức theo lĩnh vực trong workspace

## Gói dịch vụ Workspace trên LongSang:
- **Free**: 50 documents, 100 queries/tháng - Phù hợp để thử nghiệm workspace
- **Pro 199,000đ/tháng**: 500 docs, import YouTube, PDF vào workspace
- **Team 499,000đ/tháng**: Workspace không giới hạn, API access

## Link truy cập Workspace:
- Trang chủ: longsang.vn
- Workspace (My Brain): longsang.vn/my-brain
- Đăng ký: longsang.vn/auth/sign-up
- Bảng giá: longsang.vn/pricing

Bạn có thể bắt đầu sử dụng workspace miễn phí ngay hôm nay!`;

async function updateDoc() {
  console.log("🔄 Updating Second Brain doc with workspace keywords...\n");

  // 1. Update content
  const { error: updateError } = await supabase
    .from("knowledge_base")
    .update({ content: NEW_SECOND_BRAIN_CONTENT })
    .eq("title", "Second Brain - Bộ Não Thứ Hai Của Bạn");

  if (updateError) {
    console.error("❌ Update error:", updateError.message);
    return;
  }
  console.log("✅ Content updated");

  // 2. Regenerate embedding
  console.log("🔄 Regenerating embedding...");
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: NEW_SECOND_BRAIN_CONTENT,
  });

  const embedding = embeddingRes.data[0]?.embedding;
  if (!embedding) {
    console.error("❌ Failed to generate embedding");
    return;
  }

  const { error: embedError } = await supabase
    .from("knowledge_base")
    .update({ embedding })
    .eq("title", "Second Brain - Bộ Não Thứ Hai Của Bạn");

  if (embedError) {
    console.error("❌ Embedding update error:", embedError.message);
    return;
  }

  console.log("✅ Embedding updated");
  console.log('\n🎉 Done! "workspace" queries should now match Second Brain doc');
}

updateDoc().catch(console.error);
