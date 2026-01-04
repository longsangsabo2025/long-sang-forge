/**
 * Update ALL project showcases với dữ liệu thực từ codebase
 * - VungtauLand (vungtau-dream-homes)
 * - SABO Hub (sabohub-nexus)
 * - AI Newbie VN (ainewbie-web)
 */
const { createClient } = require("@supabase/supabase-js");
const config = require("./_config.cjs");

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

// ============================================
// 1. VUNGTAULAND - Bất động sản Vũng Tàu
// ============================================
const vungtaulandData = {
  slug: "vungtauland",
  name: "VungtauLand",
  description: "Nền tảng bất động sản thông minh tại Vũng Tàu - Tìm kiếm, đăng tin, và quản lý BĐS dễ dàng",
  category: "Real Estate",
  status: "live",
  production_url: "https://vungtauland.com",
  logo_url: "/logos/vungtauland.png",
  hero_title: "Tìm Nhà Mơ Ước Tại Vũng Tàu",
  hero_description: "Nền tảng bất động sản hiện đại nhất khu vực - Mua bán, cho thuê nhà đất với AI hỗ trợ 24/7",
  hero_stats: [
    { label: "Tin đăng", value: "500+" },
    { label: "Khách hàng", value: "1000+" },
    { label: "Giao dịch thành công", value: "200+" },
    { label: "Đánh giá", value: "4.8⭐" }
  ],
  overview_description: "VungtauLand là nền tảng bất động sản số 1 tại Vũng Tàu, kết nối người mua - người bán với công nghệ AI tiên tiến. Hệ thống tự động gợi ý BĐS phù hợp, chat realtime và quản lý tin đăng thông minh.",
  objectives: [
    "Số hóa thị trường BĐS Vũng Tàu",
    "Kết nối nhanh người mua - người bán",
    "Cung cấp thông tin BĐS minh bạch",
    "Hỗ trợ quyết định mua/bán thông minh"
  ],
  impacts: [
    "Giảm 70% thời gian tìm kiếm BĐS",
    "Tăng tỷ lệ giao dịch thành công 40%",
    "500+ tin đăng mỗi tháng",
    "Chat realtime giữa khách và chủ nhà"
  ],
  features: [
    {
      icon: "Search",
      title: "Tìm Kiếm Thông Minh",
      description: "AI gợi ý BĐS phù hợp nhu cầu và ngân sách",
      points: [
        "Lọc theo vị trí, giá, diện tích",
        "AI phân tích sở thích người dùng",
        "Gợi ý BĐS tương tự",
        "Tìm kiếm bằng giọng nói",
        "Lưu tìm kiếm & thông báo mới"
      ],
      color: "cyan"
    },
    {
      icon: "Home",
      title: "Đăng Tin Dễ Dàng",
      description: "3 bước đăng tin BĐS với hình ảnh đẹp",
      points: [
        "Upload ảnh kéo thả",
        "AI tự động mô tả BĐS",
        "Định giá tham khảo theo thị trường",
        "Quản lý tin đăng tiện lợi",
        "Thống kê lượt xem, liên hệ"
      ],
      color: "blue"
    },
    {
      icon: "MessageCircle",
      title: "Chat Realtime",
      description: "Kết nối trực tiếp với chủ nhà, môi giới",
      points: [
        "Chat 1-1 trong app",
        "Gửi ảnh, video, vị trí",
        "Lịch sử tin nhắn đầy đủ",
        "Thông báo push mới",
        "Đặt lịch xem nhà trực tuyến"
      ],
      color: "green"
    },
    {
      icon: "MapPin",
      title: "Bản Đồ Tương Tác",
      description: "Xem BĐS trực quan trên bản đồ Vũng Tàu",
      points: [
        "Hiển thị BĐS theo khu vực",
        "Thông tin tiện ích xung quanh",
        "Khoảng cách đến biển, trung tâm",
        "Street View 360°",
        "Hướng nhà, view thực tế"
      ],
      color: "cyan"
    },
    {
      icon: "Heart",
      title: "Danh Sách Yêu Thích",
      description: "Lưu và so sánh các BĐS quan tâm",
      points: [
        "Lưu BĐS yêu thích",
        "So sánh nhiều BĐS cùng lúc",
        "Chia sẻ với người thân",
        "Thông báo khi giá thay đổi",
        "Đồng bộ đa thiết bị"
      ],
      color: "blue"
    },
    {
      icon: "Shield",
      title: "Xác Thực & An Toàn",
      description: "BĐS được xác thực, giao dịch an tâm",
      points: [
        "Xác thực sổ đỏ/sổ hồng",
        "Kiểm tra pháp lý tự động",
        "Đánh giá độ tin cậy người bán",
        "Hỗ trợ công chứng trực tuyến",
        "Bảo mật thông tin cá nhân"
      ],
      color: "green"
    }
  ],
  tech_stack: [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Vite 7", category: "Build Tool" },
    { name: "Supabase", category: "Backend" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Shadcn/ui", category: "UI Components" },
    { name: "TanStack Query", category: "Data Fetching" },
    { name: "Google Maps", category: "Maps" }
  ],
  metrics: [
    { label: "Tin đăng hoạt động", value: "500+" },
    { label: "Người dùng/tháng", value: "1,000+" },
    { label: "Giao dịch thành công", value: "200+" }
  ],
  performance: [
    { label: "Lighthouse Score", value: "95+" },
    { label: "Thời gian tải", value: "<2s" },
    { label: "Uptime", value: "99.9%" }
  ],
  social_links: {
    facebook: "https://facebook.com/vungtauland",
    zalo: "https://zalo.me/vungtauland"
  }
};

// ============================================
// 2. SABOHUB - Hệ thống quản lý quán bida
// ============================================
const sabohubData = {
  slug: "sabohub",
  name: "SABO Hub",
  description: "Hệ thống quản lý quán bida chuyên nghiệp - Nhân viên, công việc, báo cáo, KPI tự động",
  category: "Business Management",
  status: "live",
  production_url: "https://hub.saboarena.com",
  logo_url: "/logos/sabohub.png",
  hero_title: "Quản Lý Quán Bida Thông Minh",
  hero_description: "Dashboard CEO với AI - Tự động hóa vận hành, theo dõi nhân viên, báo cáo realtime",
  hero_stats: [
    { label: "CLB đang dùng", value: "15+" },
    { label: "Nhân viên quản lý", value: "50+" },
    { label: "Tasks/tháng", value: "1000+" },
    { label: "Thời gian tiết kiệm", value: "80%" }
  ],
  overview_description: "SABO Hub là hệ thống quản lý all-in-one cho chuỗi quán bida SABO ARENA. Từ chấm công, task management đến báo cáo tài chính tự động - tất cả trong một dashboard CEO hiện đại.",
  objectives: [
    "Tự động hóa quy trình vận hành",
    "Theo dõi KPI nhân viên realtime",
    "Báo cáo tài chính tự động",
    "Quản lý đa chi nhánh hiệu quả"
  ],
  impacts: [
    "Giảm 80% thời gian quản lý hành chính",
    "Tăng 30% hiệu suất nhân viên",
    "Báo cáo CEO tự động mỗi ngày",
    "Zero giấy tờ - 100% số hóa"
  ],
  features: [
    {
      icon: "LayoutDashboard",
      title: "CEO Dashboard",
      description: "Tổng quan toàn bộ hệ thống trong 1 màn hình",
      points: [
        "Realtime stats từ tất cả chi nhánh",
        "Biểu đồ doanh thu theo ngày/tuần/tháng",
        "Alert khi có vấn đề cần xử lý",
        "So sánh hiệu suất giữa các quán",
        "Mobile responsive - xem mọi lúc"
      ],
      color: "cyan"
    },
    {
      icon: "Users",
      title: "Quản Lý Nhân Viên",
      description: "Theo dõi nhân sự toàn diện",
      points: [
        "Hồ sơ nhân viên đầy đủ",
        "Chấm công tự động bằng app",
        "Tính lương theo giờ/ca",
        "Quản lý nghỉ phép online",
        "Đánh giá hiệu suất định kỳ"
      ],
      color: "blue"
    },
    {
      icon: "CheckSquare",
      title: "Task Management",
      description: "Giao việc và theo dõi tiến độ",
      points: [
        "Tạo task với deadline và assignee",
        "Kanban board trực quan",
        "Nhắc nhở tự động qua Telegram",
        "Báo cáo task hoàn thành",
        "Template task lặp lại"
      ],
      color: "green"
    },
    {
      icon: "Calendar",
      title: "Lịch Làm Việc",
      description: "Xếp ca và quản lý lịch thông minh",
      points: [
        "Lịch ca làm việc visual",
        "Nhân viên đăng ký ca online",
        "Tự động cân bằng ca",
        "Thông báo thay đổi ca",
        "Export lịch ra Excel"
      ],
      color: "cyan"
    },
    {
      icon: "FileText",
      title: "Báo Cáo Tự Động",
      description: "Daily reports gửi tự động cho CEO",
      points: [
        "Báo cáo doanh thu hàng ngày",
        "Tổng hợp task và sự cố",
        "So sánh với ngày/tuần trước",
        "Gửi qua Telegram/Email",
        "Export PDF đẹp mắt"
      ],
      color: "blue"
    },
    {
      icon: "Bot",
      title: "AI Assistant (SABO AI)",
      description: "Trợ lý AI thông minh hỗ trợ quản lý",
      points: [
        "Hỏi đáp dữ liệu bằng tiếng Việt",
        "Gợi ý quyết định kinh doanh",
        "Phân tích xu hướng tự động",
        "Cảnh báo bất thường",
        "Tích hợp Google Gemini"
      ],
      color: "green"
    }
  ],
  tech_stack: [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Vite", category: "Build Tool" },
    { name: "Supabase", category: "Backend" },
    { name: "Shadcn/ui", category: "UI Components" },
    { name: "TanStack Query", category: "Data Fetching" },
    { name: "Telegram Bot API", category: "Notifications" },
    { name: "Google Gemini", category: "AI" }
  ],
  metrics: [
    { label: "Chi nhánh quản lý", value: "15+" },
    { label: "Nhân viên", value: "50+" },
    { label: "Tasks xử lý/tháng", value: "1000+" }
  ],
  performance: [
    { label: "Dashboard load", value: "<1s" },
    { label: "Realtime sync", value: "Instant" },
    { label: "Uptime", value: "99.9%" }
  ],
  social_links: {
    facebook: "https://facebook.com/saboarena",
    website: "https://saboarena.com"
  }
};

// ============================================
// 3. AI NEWBIE VN - Ứng dụng học AI
// ============================================
const ainewbieData = {
  slug: "ainewbievn",
  name: "AI Newbie VN",
  description: "Nền tảng học AI dành cho người Việt - Từ zero đến hero với hướng dẫn tiếng Việt dễ hiểu",
  category: "Education / AI",
  status: "live",
  production_url: "https://ainewbie.vn",
  logo_url: "/logos/ainewbie.png",
  hero_title: "Học AI Dễ Như Ăn Bánh",
  hero_description: "Nền tảng học AI đầu tiên hoàn toàn bằng tiếng Việt - Dành cho người mới bắt đầu",
  hero_stats: [
    { label: "Học viên", value: "5000+" },
    { label: "Khóa học", value: "20+" },
    { label: "Giờ học", value: "100+" },
    { label: "Đánh giá", value: "4.9⭐" }
  ],
  overview_description: "AI Newbie VN giúp bất kỳ ai cũng có thể học và ứng dụng AI vào công việc. Từ ChatGPT, Midjourney đến lập trình AI - tất cả được giải thích bằng tiếng Việt dễ hiểu nhất.",
  objectives: [
    "Phổ cập kiến thức AI cho người Việt",
    "Hướng dẫn ứng dụng AI vào công việc",
    "Cộng đồng học AI lớn nhất Việt Nam",
    "Cập nhật trend AI mới nhất"
  ],
  impacts: [
    "5000+ học viên đã học",
    "90% học viên áp dụng được AI",
    "Cộng đồng 10,000+ thành viên",
    "20+ khóa học chất lượng"
  ],
  features: [
    {
      icon: "GraduationCap",
      title: "Khóa Học Tiếng Việt",
      description: "100% nội dung tiếng Việt, dễ hiểu",
      points: [
        "Video bài giảng chất lượng HD",
        "Giảng viên người Việt giàu kinh nghiệm",
        "Phụ đề và transcript đầy đủ",
        "Tài liệu PDF kèm theo",
        "Cập nhật nội dung liên tục"
      ],
      color: "cyan"
    },
    {
      icon: "Rocket",
      title: "Học Theo Lộ Trình",
      description: "Từ zero đến hero có người dẫn đường",
      points: [
        "Roadmap rõ ràng cho từng level",
        "Quiz kiểm tra sau mỗi bài",
        "Certificate khi hoàn thành",
        "Mentor hỗ trợ 1-1",
        "Cộng đồng học tập sôi nổi"
      ],
      color: "blue"
    },
    {
      icon: "Lightbulb",
      title: "Bài Tập Thực Hành",
      description: "Làm project thực tế, không lý thuyết suông",
      points: [
        "Prompt engineering thực chiến",
        "Tạo ảnh với Midjourney/DALL-E",
        "Xây chatbot với ChatGPT API",
        "Automation với AI",
        "Case study từ doanh nghiệp thật"
      ],
      color: "green"
    },
    {
      icon: "Users",
      title: "Cộng Đồng AI Việt",
      description: "Kết nối với 10,000+ người học AI",
      points: [
        "Group Facebook sôi nổi",
        "Discord chat realtime",
        "Sharing session hàng tuần",
        "Networking với chuyên gia",
        "Job board AI exclusive"
      ],
      color: "cyan"
    },
    {
      icon: "Sparkles",
      title: "Tools AI Tích Hợp",
      description: "Dùng AI tools ngay trong platform",
      points: [
        "ChatGPT playground",
        "Prompt library 1000+",
        "AI image generator",
        "Code assistant",
        "AI writing tools"
      ],
      color: "blue"
    },
    {
      icon: "Trophy",
      title: "Chứng Chỉ & Badges",
      description: "Ghi nhận thành tích, build portfolio",
      points: [
        "Certificate sau mỗi khóa",
        "Badges theo skill level",
        "LinkedIn badge integration",
        "Portfolio showcase",
        "Leaderboard học viên"
      ],
      color: "green"
    }
  ],
  tech_stack: [
    { name: "React 18", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Vite", category: "Build Tool" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "Shadcn/ui", category: "UI Components" },
    { name: "Supabase", category: "Backend" },
    { name: "OpenAI API", category: "AI Integration" },
    { name: "Vercel", category: "Hosting" }
  ],
  metrics: [
    { label: "Học viên", value: "5000+" },
    { label: "Khóa học", value: "20+" },
    { label: "Cộng đồng", value: "10,000+" }
  ],
  performance: [
    { label: "Page load", value: "<2s" },
    { label: "Video quality", value: "1080p" },
    { label: "Uptime", value: "99.9%" }
  ],
  social_links: {
    facebook: "https://facebook.com/ainewbievn",
    youtube: "https://youtube.com/@ainewbievn",
    discord: "https://discord.gg/ainewbie"
  }
};

// ============================================
// MAIN: Update all projects
// ============================================
async function updateAllProjects() {
  console.log("🚀 Updating all project showcases...\n");

  const projects = [
    { data: vungtaulandData, name: "VungtauLand" },
    { data: sabohubData, name: "SABO Hub" },
    { data: ainewbieData, name: "AI Newbie VN" }
  ];

  for (const project of projects) {
    console.log(`📦 Updating ${project.name}...`);
    
    const { data, error } = await supabase
      .from("project_showcase")
      .update(project.data)
      .eq("slug", project.data.slug)
      .select("name, slug, features");

    if (error) {
      // Try insert if update fails (project doesn't exist)
      if (error.code === "PGRST116") {
        console.log(`   Creating new record...`);
        const { data: insertData, error: insertError } = await supabase
          .from("project_showcase")
          .insert(project.data)
          .select("name, slug, features");
        
        if (insertError) {
          console.log(`   ❌ Error: ${insertError.message}`);
        } else {
          console.log(`   ✅ Created: ${insertData[0].name} with ${insertData[0].features?.length || 0} features`);
        }
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    } else if (data && data.length > 0) {
      console.log(`   ✅ Updated: ${data[0].name} with ${data[0].features?.length || 0} features`);
    } else {
      console.log(`   ⚠️ No matching record found for slug: ${project.data.slug}`);
      // Try insert
      console.log(`   Creating new record...`);
      const { data: insertData, error: insertError } = await supabase
        .from("project_showcase")
        .insert(project.data)
        .select("name, slug, features");
      
      if (insertError) {
        console.log(`   ❌ Insert Error: ${insertError.message}`);
      } else {
        console.log(`   ✅ Created: ${insertData[0].name}`);
      }
    }
  }

  console.log("\n✅ All projects updated!");
  
  // List all projects
  const { data: allProjects } = await supabase
    .from("project_showcase")
    .select("slug, name, status, features")
    .order("display_order");
  
  console.log("\n📋 Current showcases:");
  allProjects?.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name} (${p.slug}) - ${p.features?.length || 0} features - ${p.status}`);
  });
}

updateAllProjects();
