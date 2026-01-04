/**
 * Add testimonials column and update data for all showcases
 */
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const config = require("./_config.cjs");

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

// Testimonials for each project
const testimonialsByProject = {
  "sabo-arena": [
    {
      name: "Anh Minh",
      role: "Chủ CLB Bi-a Vũng Tàu",
      content: "SABO Arena giúp tôi quản lý giải đấu dễ dàng hơn rất nhiều. Trước đây phải ghi chép bằng tay, giờ mọi thứ đều tự động.",
      rating: 5,
    },
    {
      name: "Chị Lan",
      role: "Người chơi bi-a",
      content: "Giao diện đẹp, dễ sử dụng. Tôi có thể theo dõi ranking và lịch thi đấu mọi lúc mọi nơi.",
      rating: 5,
    },
    {
      name: "Anh Tùng",
      role: "Quản lý giải đấu",
      content: "Tính năng livestream kết quả realtime rất tuyệt vời. Người chơi và khán giả đều có thể theo dõi trực tiếp.",
      rating: 5,
    },
  ],
  "vungtauland": [
    {
      name: "Chị Hương",
      role: "Môi giới BĐS Vũng Tàu",
      content: "VungtauLand giúp tôi đăng tin nhanh chóng và tiếp cận được nhiều khách hàng hơn. Giao diện rất chuyên nghiệp.",
      rating: 5,
    },
    {
      name: "Anh Đức",
      role: "Người mua nhà",
      content: "Tìm được căn hộ ưng ý chỉ trong 2 tuần nhờ tính năng lọc thông minh. Thông tin BĐS rất chi tiết và chính xác.",
      rating: 5,
    },
    {
      name: "Chị Mai",
      role: "Chủ đầu tư",
      content: "Đăng dự án lên VungtauLand, khách hàng liên hệ liên tục. Hệ thống chat realtime rất tiện lợi.",
      rating: 5,
    },
  ],
  "sabohub": [
    {
      name: "Anh Phong",
      role: "Chủ CLB SABO Phú Nhuận",
      content: "SABO Hub giúp tôi quản lý nhân viên hiệu quả hơn. Báo cáo tự động mỗi ngày, không cần họp nhiều như trước.",
      rating: 5,
    },
    {
      name: "Chị Vy",
      role: "Quản lý ca",
      content: "Chấm công bằng app rất tiện, không còn quên ghi sổ. Lịch làm việc rõ ràng, dễ theo dõi.",
      rating: 5,
    },
    {
      name: "Anh Khoa",
      role: "CEO SABO ARENA",
      content: "Dashboard CEO cung cấp cái nhìn tổng quan về toàn bộ hệ thống. AI Assistant trả lời câu hỏi về dữ liệu rất nhanh.",
      rating: 5,
    },
  ],
  "ainewbievn": [
    {
      name: "Bạn Linh",
      role: "Sinh viên Marketing",
      content: "Học xong khóa ChatGPT, tôi đã áp dụng vào viết content và tăng năng suất gấp 3 lần. Nội dung dễ hiểu, thực tế.",
      rating: 5,
    },
    {
      name: "Anh Hoàng",
      role: "Freelancer Designer",
      content: "Midjourney thay đổi cách tôi làm việc. Nhờ AI Newbie VN mà tôi từ zero đến có thể tạo ảnh AI chuyên nghiệp.",
      rating: 5,
    },
    {
      name: "Chị Thảo",
      role: "Chủ shop online",
      content: "Cộng đồng AI Newbie VN rất helpful. Mỗi khi có thắc mắc đều được giải đáp nhanh chóng.",
      rating: 5,
    },
  ],
};

async function main() {
  console.log("🔧 Adding testimonials column and updating data...\n");

  // 1. Add column via direct PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL\n");

    // Add column
    console.log("1. Adding testimonials column...");
    await client.query(`
      ALTER TABLE project_showcase 
      ADD COLUMN IF NOT EXISTS testimonials JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("   ✅ Column added\n");

    await client.end();
  } catch (error) {
    console.log("   ⚠️ Column might already exist:", error.message);
    await client.end();
  }

  // 2. Update testimonials for each project via Supabase
  console.log("2. Updating testimonials for each project...\n");

  for (const [slug, testimonials] of Object.entries(testimonialsByProject)) {
    const { data, error } = await supabase
      .from("project_showcase")
      .update({ testimonials })
      .eq("slug", slug)
      .select("name, slug");

    if (error) {
      console.log(`   ❌ ${slug}: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   ✅ ${data[0].name}: ${testimonials.length} testimonials`);
    } else {
      console.log(`   ⚠️ ${slug}: No matching record`);
    }
  }

  console.log("\n✅ Done!");
}

main();
