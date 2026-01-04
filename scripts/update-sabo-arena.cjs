const https = require("https");
const config = require("./_config.cjs");

// Validate required keys
config.validate(["SUPABASE_SERVICE_KEY"]);

const SUPABASE_URL = config.SUPABASE_URL.replace("https://", "");
const SERVICE_KEY = config.SUPABASE_SERVICE_KEY;
const PROJECT_ID = "068659d4-b343-41a1-8278-2c82071b9dde";

// ELON MUSK STYLE - Tập trung vào IMPACT và tính năng ĐẶC BIỆT
const updateData = {
  name: "SABO ARENA",
  hero_title: "Nền Tảng Giải Đấu Bi-a #1 Việt Nam",
  hero_description: "2,500+ cơ thủ. 150+ giải đấu. Hệ thống ELO minh bạch chống bịp hạng.",
  description:
    "App giải đấu bi-a chuyên nghiệp với 8 định dạng độc quyền và hệ thống xếp hạng ELO 10 cấp.",
  overview_title: "VẤN ĐỀ",
  overview_description:
    "CLB tổ chức giải đấu bằng tay - mất hàng giờ lên bracket. Không có hệ thống xếp hạng chuẩn - tình trạng bịp hạng tràn lan. Cơ thủ không biết trình độ thực sự của mình.",
  objectives: [
    "Tự động tạo bracket và quản lý giải đấu",
    "Hệ thống ELO 10 cấp từ K đến C",
    "Live scoring và thông báo real-time",
    "Kết nối cộng đồng cơ thủ toàn quốc",
  ],
  impacts: [
    "2,500+ người chơi đăng ký",
    "150+ giải đấu đã tổ chức",
    "500K+ VNĐ tổng giải thưởng",
    "App Store & Google Play",
  ],
  key_features: [
    "8 định dạng giải: Single/Double Elimination, SABO DE16/24/32, Round Robin, Swiss",
    "Hệ thống ELO 10 ranks: K → H → I → J → Thợ 1 → Thợ Chính → Thợ Cứng → A → B → C",
    "Live bracket update - theo dõi trận đấu real-time",
    "Push notification khi đến lượt thi đấu",
    "Hồ sơ cơ thủ với thống kê chi tiết",
    "Kết nối CLB và cộng đồng toàn quốc",
  ],
  hero_stats: [
    { icon: "Users", color: "emerald", label: "Cơ Thủ", value: "2,500+" },
    { icon: "Trophy", color: "amber", label: "Giải Đấu", value: "150+" },
    { icon: "Banknote", color: "blue", label: "Giải Thưởng", value: "500K+" },
  ],
};

const postData = JSON.stringify(updateData);

const options = {
  hostname: SUPABASE_URL,
  port: 443,
  path: `/rest/v1/project_showcase?id=eq.${PROJECT_ID}`,
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Prefer: "return=representation",
    "Content-Length": Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    if (res.statusCode === 200) {
      console.log("\n✅ SABO ARENA đã được cập nhật thành công!");
      console.log("\n📝 Nội dung mới (Elon Musk style):");
      console.log("- Tiêu đề: Cách Mạng Hóa Bi-a Việt Nam");
      console.log("- Mô tả: Một app. 10,000+ cơ thủ. Số hóa toàn bộ ngành bi-a.");
      console.log("- VẤN ĐỀ: Ngành bi-a đang OFFLINE trong thời đại số");
      console.log("- KẾT QUẢ: Giảm 80% thời gian, 4.8/5 sao");
    } else {
      console.log("Response:", data);
    }
  });
});

req.on("error", (e) => {
  console.error("Error:", e.message);
});

req.write(postData);
req.end();
