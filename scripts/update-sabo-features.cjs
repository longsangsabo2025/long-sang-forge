/**
 * Update SABO Arena với 10 features đầy đủ từ codebase thực tế
 * Based on actual app structure: D:\0.PROJECTS\02-SABO-ECOSYSTEM\sabo-arena\app
 */
const { createClient } = require("@supabase/supabase-js");
const config = require("./_config.cjs");

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

// 10 FEATURES - Based on actual app folders in lib/presentation/
const features = [
  {
    icon: "Trophy",
    title: "8 Định Dạng Giải Đấu",
    description: "Từ Single Elimination đến định dạng độc quyền SABO DE16/DE32",
    points: [
      "Single & Double Elimination (SE8, SE16, DE8, DE16, DE32)",
      "SABO DE16/DE32 - Định dạng độc quyền",
      "Round Robin & Swiss System",
      "Parallel Groups & Winner Takes All",
      "Tự động tạo bracket và ghép cặp",
    ],
    color: "cyan",
  },
  {
    icon: "Target",
    title: "ELO Rating 12 Hạng",
    description: "Hệ thống xếp hạng minh bạch chuẩn quốc tế với 12 tier",
    points: [
      "12 hạng từ K → C (K, H, I, J, Thợ 1, Thợ Chính, Thợ Cứng, A, B, C)",
      "Công thức ELO chuẩn FIDE - công bằng tuyệt đối",
      "Leaderboard real-time cập nhật liên tục",
      "Lịch sử ELO chi tiết cho từng trận",
      "Anti-boosting system chống bịp hạng",
    ],
    color: "blue",
  },
  {
    icon: "Coins",
    title: "SPA Points & Voucher",
    description: "Kiếm SPA từ giải đấu, đổi voucher giảm 10-50% phí bàn",
    points: [
      "Kiếm SPA từ giải đấu và nhiệm vụ hàng ngày",
      "Đổi voucher giảm 10-50% phí bàn",
      "15+ câu lạc bộ đối tác chấp nhận",
      "Hệ thống loyalty program cho member",
      "SPA Wallet với lịch sử giao dịch chi tiết",
    ],
    color: "green",
  },
  {
    icon: "Building2",
    title: "Club Management System",
    description: "Bộ công cụ quản lý CLB chuyên nghiệp cho chủ quán",
    points: [
      "Dashboard quản lý thành viên, doanh thu",
      "Tạo giải đấu trong 3 phút với wizard",
      "Quản lý bàn & đặt chỗ trực tuyến",
      "Duyệt voucher redemption 1 click",
      "Staff management & permission system",
    ],
    color: "cyan",
  },
  {
    icon: "Users",
    title: "Mạng Xã Hội Tích Hợp",
    description: "Kết nối cộng đồng bi-a qua chat, feed, follow",
    points: [
      "Activity Feed với bài đăng, ảnh, video",
      "Chat 1-on-1 và group real-time",
      "Follow cơ thủ giỏi để học hỏi",
      "Direct messages & notifications",
      "Saved posts & search players",
    ],
    color: "blue",
  },
  {
    icon: "Swords",
    title: "Challenge System 1v1",
    description: "Thách đấu trực tiếp với cược ELO và prize pool",
    points: [
      "Tìm đối thủ cùng trình độ",
      "Đặt cược ELO points",
      "Live scoring trong trận",
      "Lịch sử đối đầu head-to-head",
      "Matchmaking thông minh theo ELO",
    ],
    color: "green",
  },
  {
    icon: "BarChart3",
    title: "Analytics & Statistics",
    description: "Thống kê chi tiết cho cơ thủ và CLB",
    points: [
      "Tournament history với chi tiết từng trận",
      "Win rate, streak, best placement",
      "Club reports & revenue analytics",
      "Rank progression chart",
      "Performance comparison với đối thủ",
    ],
    color: "cyan",
  },
  {
    icon: "Bell",
    title: "Smart Notifications",
    description: "Push notification thông minh, không spam",
    points: [
      "Thông báo khi đến lượt thi đấu",
      "Alert giải đấu mới trong CLB follow",
      "Reminder trước trận 15 phút",
      "Kết quả trận đấu real-time",
      "Notification settings tùy chỉnh",
    ],
    color: "blue",
  },
  {
    icon: "Calendar",
    title: "Table Reservation",
    description: "Đặt bàn trực tuyến, xem lịch trống real-time",
    points: [
      "Xem bàn trống theo khung giờ",
      "Đặt bàn trước không cần gọi điện",
      "Nhận thông báo nhắc nhở",
      "Quản lý reservation history",
      "CLB dashboard quản lý đặt bàn",
    ],
    color: "green",
  },
  {
    icon: "Zap",
    title: "Hiệu Năng Tối Ưu",
    description: "App Flutter mượt mà trên mọi thiết bị",
    points: [
      "Tốc độ tải ảnh nhanh (<200ms)",
      "Cuộn list mượt 60 FPS với Flutter",
      "Khởi động app chỉ 1.8 giây",
      "Hỗ trợ iOS, Android và Web",
      "Offline mode cho xem thông tin cơ bản",
    ],
    color: "cyan",
  },
];

async function update() {
  console.log("🔄 Updating SABO Arena features...");
  console.log(`📊 Total features: ${features.length}`);

  const { data, error } = await supabase
    .from("project_showcase")
    .update({ features: features })
    .eq("slug", "sabo-arena")
    .select("name, slug, features");

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log("✅ Updated:", data[0].name);
  console.log("📊 Features count:", data[0].features.length);
  console.log("\n📋 Features list:");
  data[0].features.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.title}`);
  });
}

update();
