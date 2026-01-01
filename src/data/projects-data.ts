import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Cloud,
  Coins,
  Cpu,
  CreditCard,
  Database,
  LucideIcon,
  MapPin,
  MessageSquare,
  Shield,
  ShoppingCart,
  Smartphone,
  Target,
  Trophy,
  Users,
  Utensils,
  Zap,
} from "lucide-react";

export interface ProjectFeature {
  icon: LucideIcon;
  title: string;
  points: string[];
  color: "cyan" | "blue" | "green";
}

export interface ProjectNode {
  id: number;
  icon: LucideIcon;
  label: string;
  x: number;
  y: number;
  color: "neon-cyan" | "neon-blue" | "neon-green";
}

export interface ProjectMetric {
  label: string;
  value: string;
  unit: string;
  trend: string;
}

export interface TechStackItem {
  name: string;
  category: string;
  icon: LucideIcon;
  iconifyIcon?: string; // Iconify icon name (e.g., "logos:flutter", "vscode-icons:file-type-firebase")
}

export interface TechnicalDetails {
  performance?: {
    label: string;
    value: string;
  }[];
  tools?: {
    name: string;
    iconifyIcon?: string;
  }[];
  infrastructure?: {
    label: string;
    value: string;
  }[];
}

export interface ProjectData {
  id: number;
  name: string;
  slug?: string; // URL slug for routing (e.g., "ainewbievn", "sabohub")
  description: string;
  progress: number;
  category: string;
  icon: LucideIcon;
  productionUrl?: string; // URL của trang web production
  screenshots?: string[]; // Real screenshots of the project

  // NEW: Enhanced sidebar fields
  logoUrl?: string; // Project logo/favicon URL
  status: "live" | "development" | "planned" | "maintenance"; // Project status
  statusLabel?: string; // Custom status label (optional)

  // Hero Section
  heroTitle: string;
  heroDescription: string;
  heroStats: {
    icon: LucideIcon;
    label: string;
    value: string;
    color: string;
  }[];

  // Overview
  overviewTitle: string;
  overviewDescription: string;
  objectives: string[];
  impacts: string[];

  // Tech Architecture
  techNodes: ProjectNode[];
  techConnections: { from: number; to: number }[];
  techStack?: TechStackItem[];
  technicalDetails?: TechnicalDetails;

  // Features
  features: ProjectFeature[];

  // Stats & Metrics
  metrics: ProjectMetric[];
  barData: { name: string; value: number; target: number }[];
  lineData: { month: string; users: number; performance: number }[];
}

export const projectsData: ProjectData[] = [
  // SABO Arena Project
  {
    id: 1,
    name: "SABO Arena",
    slug: "sabo-arena",
    description: "Nền tảng thi đấu bi-a cho cộng đồng",
    progress: 95,
    category: "Mobile App",
    icon: Zap,
    productionUrl: "https://saboarena.com",
    screenshots: [
      "/images/sabo-arena-1.jpg",
      "/images/sabo-arena-2.jpg",
      "/images/sabo-arena-3.jpg",
      "/images/sabo-arena-4.jpg",
    ],
    // Enhanced sidebar fields
    status: "live",
    logoUrl: "/images/logos/sabo-arena-logo.png",

    heroTitle: "SABO ARENA",
    heroDescription:
      "Nền tảng thi đấu bi-a cho cộng đồng Vũng Tàu - 8 định dạng giải đấu, ELO ranking minh bạch, kiếm SPA Points đổi voucher thật",
    heroStats: [
      { icon: Users, label: "Người Chơi", value: "1,500+", color: "neon-green" },
      { icon: Trophy, label: "Giải Đấu", value: "120+", color: "neon-cyan" },
      { icon: Cloud, label: "Câu Lạc Bộ", value: "15+", color: "neon-blue" },
    ],

    overviewTitle: "TỔNG QUAN DỰ ÁN",
    overviewDescription:
      "SABO Arena là nền tảng thi đấu bi-a tại Vũng Tàu, tích hợp hệ thống ELO ranking minh bạch, 8 định dạng giải đấu quốc tế, và chương trình SPA Points cho phép người chơi kiếm điểm và đổi voucher thật.",
    objectives: [
      "Xây dựng hệ thống giải đấu bi-a với ELO ranking minh bạch",
      "Kết nối cộng đồng người chơi bi-a qua mạng xã hội tích hợp",
      "Hỗ trợ chủ câu lạc bộ quản lý giải đấu tự động, giảm đáng kể thời gian tổ chức",
    ],
    impacts: [
      "1,500+ người chơi đã tham gia nền tảng",
      "120+ giải đấu đã tổ chức tại 15+ câu lạc bộ",
      "Phản hồi tích cực từ cộng đồng người chơi",
    ],

    techNodes: [
      { id: 1, icon: Smartphone, label: "Flutter App", x: 50, y: 20, color: "neon-cyan" },
      { id: 2, icon: Cloud, label: "Firebase", x: 20, y: 50, color: "neon-blue" },
      { id: 3, icon: Database, label: "Supabase", x: 80, y: 50, color: "neon-green" },
      { id: 4, icon: Users, label: "Auth System", x: 35, y: 80, color: "neon-cyan" },
      { id: 5, icon: Trophy, label: "Tournament Engine", x: 65, y: 80, color: "neon-blue" },
      { id: 6, icon: MessageSquare, label: "Chat & Social", x: 50, y: 95, color: "neon-green" },
    ],
    techConnections: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 6 },
      { from: 5, to: 6 },
    ],

    techStack: [
      { name: "Flutter", category: "Framework", icon: Smartphone, iconifyIcon: "logos:flutter" },
      { name: "Firebase", category: "Backend", icon: Cloud, iconifyIcon: "logos:firebase" },
      {
        name: "Supabase",
        category: "Database",
        icon: Database,
        iconifyIcon: "logos:supabase-icon",
      },
      { name: "PostgreSQL", category: "Database", icon: Database, iconifyIcon: "logos:postgresql" },
      {
        name: "Cloud Storage",
        category: "Storage",
        icon: Cloud,
        iconifyIcon: "logos:google-cloud",
      },
      {
        name: "Push Notifications",
        category: "Service",
        icon: MessageSquare,
        iconifyIcon: "vscode-icons:file-type-firebase",
      },
      {
        name: "Analytics",
        category: "Monitoring",
        icon: BarChart3,
        iconifyIcon: "logos:google-analytics",
      },
      { name: "OAuth 2.0", category: "Security", icon: Users, iconifyIcon: "mdi:shield-lock" },
    ],

    technicalDetails: {
      performance: [
        { label: "App Launch Time", value: "1.8s" },
        { label: "Image Load Speed", value: "200ms" },
        { label: "Frame Rate", value: "60 FPS" },
        { label: "Bundle Size", value: "45 MB" },
      ],
      tools: [
        { name: "VS Code", iconifyIcon: "logos:visual-studio-code" },
        { name: "Android Studio", iconifyIcon: "devicon:androidstudio" },
        { name: "Xcode", iconifyIcon: "devicon:xcode" },
        { name: "Figma", iconifyIcon: "logos:figma" },
        { name: "Postman", iconifyIcon: "logos:postman-icon" },
        { name: "Git & GitHub", iconifyIcon: "logos:github-icon" },
        { name: "Firebase Console", iconifyIcon: "logos:firebase" },
        { name: "Supabase Studio", iconifyIcon: "logos:supabase-icon" },
      ],
      infrastructure: [
        { label: "Hosting", value: "Firebase Hosting + Cloud Functions" },
        { label: "CDN", value: "Cloudflare Global CDN" },
        { label: "Database", value: "Supabase PostgreSQL (US-West)" },
        { label: "Storage", value: "Firebase Cloud Storage (Multi-region)" },
        { label: "CI/CD", value: "GitHub Actions + Fastlane" },
        { label: "Monitoring", value: "Firebase Crashlytics + Analytics" },
      ],
    },

    features: [
      {
        icon: Trophy,
        title: "8 Định Dạng Giải Đấu",
        points: [
          "Single Elimination (SE8, SE16, SE32)",
          "Double Elimination (DE8, DE16, DE32)",
          "Round Robin và Swiss System",
          "Tự động tạo bracket và ghép cặp",
        ],
        color: "cyan",
      },
      {
        icon: Target,
        title: "ELO Rating Minh Bạch",
        points: [
          "Hệ thống xếp hạng quốc tế chuẩn FIDE",
          "Mọi người bắt đầu từ 1000 điểm",
          "Công thức toán học công bằng, không can thiệp",
          "Leaderboard real-time cập nhật liên tục",
        ],
        color: "blue",
      },
      {
        icon: Coins,
        title: "SPA Points - Đổi Voucher Thật",
        points: [
          "Kiếm SPA từ giải đấu và nhiệm vụ",
          "Đổi voucher giảm 10-50% phí bàn",
          "15+ câu lạc bộ đối tác chấp nhận",
          "Mỗi chiến thắng đều có giá trị thực",
        ],
        color: "green",
      },
      {
        icon: BarChart3,
        title: "Dashboard Quản Lý CLB",
        points: [
          "Tạo giải đấu trong 3 phút với wizard",
          "Analytics chi tiết về thành viên, doanh thu",
          "Tự động tính điểm, xếp hạng, phát thưởng",
          "Duyệt voucher redemption 1 click",
        ],
        color: "cyan",
      },
      {
        icon: Users,
        title: "Mạng Xã Hội Tích Hợp",
        points: [
          "Chat 1-on-1 và group real-time",
          "Đăng ảnh/video chiến thắng lên feed",
          "Follow người chơi giỏi để học hỏi",
          "Thông báo push cho giải mới, kết quả",
        ],
        color: "blue",
      },
      {
        icon: Zap,
        title: "Hiệu Năng Tối Ưu",
        points: [
          "Tốc độ tải ảnh nhanh (200ms)",
          "Cuộn list mượt 60 FPS với Flutter",
          "Khởi động app chỉ 1.8 giây",
          "Hỗ trợ iOS, Android và iPad Pro",
        ],
        color: "green",
      },
    ],

    metrics: [
      { label: "Người Chơi", value: "1,500+", unit: "Players", trend: "" },
      { label: "Giải Đấu", value: "120+", unit: "Tournaments", trend: "" },
      { label: "Câu Lạc Bộ", value: "15+", unit: "Clubs", trend: "" },
      { label: "Trạng Thái", value: "Active", unit: "Live", trend: "" },
    ],
    barData: [
      { name: "Q1", value: 400, target: 500 },
      { name: "Q2", value: 750, target: 800 },
      { name: "Q3", value: 1100, target: 1000 },
      { name: "Q4", value: 1500, target: 1400 },
    ],
    lineData: [
      { month: "T7", users: 250, performance: 75 },
      { month: "T8", users: 450, performance: 80 },
      { month: "T9", users: 750, performance: 85 },
      { month: "T10", users: 1100, performance: 90 },
      { month: "T11", users: 1350, performance: 93 },
      { month: "T12", users: 1500, performance: 95 },
    ],
  },

  // SaboHub Project
  {
    id: 2,
    name: "SaboHub",
    slug: "sabohub",
    description: "Giải pháp quản lý toàn diện cho doanh nghiệp",
    progress: 90,
    category: "Business Management Platform",
    icon: Database,
    productionUrl: "https://sabohub.vercel.app",
    // Enhanced sidebar fields
    status: "live",
    logoUrl: "/images/logos/sabohub-logo.png",

    heroTitle: "SABOHUB",
    heroDescription:
      "Nền tảng quản lý kinh doanh được thiết kế cho các doanh nghiệp dịch vụ. 8 hệ thống tích hợp: CRM, HRM, POS, Kho, Lịch hẹn, Marketing, Báo cáo & Phân tích",
    heroStats: [
      { icon: Database, label: "Hệ Thống", value: "8+", color: "neon-cyan" },
      { icon: Users, label: "Người Dùng", value: "100+", color: "neon-blue" },
      { icon: Zap, label: "Đồng Bộ Realtime", value: "100%", color: "neon-green" },
    ],

    overviewTitle: "TỔNG QUAN DỰ ÁN",
    overviewDescription:
      "SABOHUB là nền tảng quản lý kinh doanh được thiết kế cho các doanh nghiệp dịch vụ, đặc biệt là hệ thống câu lạc bộ bi-a. Với giao diện thân thiện, SABOHUB giúp chủ doanh nghiệp và quản lý vận hành mọi hoạt động kinh doanh từ một ứng dụng duy nhất.",
    objectives: [
      "Tích hợp 8 hệ thống quản lý trong 1 ứng dụng duy nhất",
      "Đồng bộ dữ liệu theo thời gian thực trên mọi thiết bị",
      "Hệ thống phân quyền theo vai trò (RBAC) bảo mật cao",
      "Hỗ trợ đa nền tảng: iOS, Android, Web Browser",
    ],
    impacts: [
      "Giảm đáng kể thời gian quản lý hành chính",
      "Cải thiện hiệu quả vận hành và phục vụ khách hàng",
      "Tiết kiệm chi phí với giải pháp all-in-one",
      "Báo cáo tổng hợp hỗ trợ ra quyết định",
    ],

    techNodes: [
      { id: 1, icon: Smartphone, label: "Flutter", x: 50, y: 20, color: "neon-cyan" },
      { id: 2, icon: Database, label: "Supabase", x: 25, y: 50, color: "neon-green" },
      { id: 3, icon: Cloud, label: "PostgreSQL", x: 75, y: 50, color: "neon-blue" },
      { id: 4, icon: Zap, label: "Realtime", x: 50, y: 80, color: "neon-cyan" },
    ],
    techConnections: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
    ],

    techStack: [
      {
        name: "Flutter/Dart",
        category: "Framework",
        icon: Smartphone,
        iconifyIcon: "logos:flutter",
      },
      {
        name: "Material Design",
        category: "UI/UX",
        icon: Smartphone,
        iconifyIcon: "logos:material-ui",
      },
      { name: "Supabase", category: "Backend", icon: Database, iconifyIcon: "logos:supabase-icon" },
      { name: "PostgreSQL", category: "Database", icon: Database, iconifyIcon: "logos:postgresql" },
      {
        name: "Realtime Sync",
        category: "Backend",
        icon: Zap,
        iconifyIcon: "vscode-icons:file-type-firebase",
      },
      { name: "Riverpod", category: "State Management", icon: Cpu, iconifyIcon: "logos:flutter" },
      {
        name: "Clean Architecture",
        category: "Architecture",
        icon: Target,
        iconifyIcon: "mdi:folder-cog",
      },
      { name: "GPS Location", category: "Service", icon: Target, iconifyIcon: "mdi:map-marker" },
    ],

    technicalDetails: {
      performance: [
        { label: "App Launch Time", value: "1.5s" },
        { label: "Sync Speed", value: "Real-time" },
        { label: "Frame Rate", value: "60 FPS" },
        { label: "Bundle Size", value: "38 MB" },
      ],
      tools: [
        { name: "VS Code", iconifyIcon: "logos:visual-studio-code" },
        { name: "Android Studio", iconifyIcon: "devicon:androidstudio" },
        { name: "Xcode", iconifyIcon: "devicon:xcode" },
        { name: "Figma", iconifyIcon: "logos:figma" },
        { name: "Supabase Studio", iconifyIcon: "logos:supabase-icon" },
        { name: "Git & GitHub", iconifyIcon: "logos:github-icon" },
        { name: "Postman", iconifyIcon: "logos:postman-icon" },
      ],
      infrastructure: [
        { label: "Database", value: "Supabase PostgreSQL (Cloud)" },
        { label: "Authentication", value: "Supabase Auth + RBAC" },
        { label: "Storage", value: "Supabase Storage (Images, Files)" },
        { label: "Realtime", value: "WebSocket + PostgreSQL CDC" },
        { label: "CI/CD", value: "GitHub Actions + Fastlane" },
        { label: "Monitoring", value: "Supabase Dashboard + Sentry" },
      ],
    },

    features: [
      {
        icon: CheckCircle2,
        title: "Quản Lý Công Việc",
        color: "cyan" as const,
        points: [
          "Phân công rõ ràng - Mỗi người nhận việc ngay trên app",
          "Theo dõi thời gian thực - Biết ai đang làm gì, việc nào tồn đọng",
          "Tự động nhắc nhở - Hệ thống thông báo cho nhân viên",
          "Giảm thời gian nhắc nhở, tăng hiệu suất hoàn thành",
        ],
      },
      {
        icon: ShoppingCart,
        title: "Quản Lý Đơn Hàng",
        color: "blue" as const,
        points: [
          "Order bằng app - Rõ ràng, chính xác, gửi ngay cho bếp",
          "Tính tiền tự động - Không sai, không thiếu",
          "Gán bàn cho mỗi order - Phục vụ đúng bàn, không nhầm lẫn",
          "Giảm sai sót, tăng tốc độ phục vụ",
        ],
      },
      {
        icon: Utensils,
        title: "Quản Lý Thực Đơn",
        color: "green" as const,
        points: [
          "Cập nhật giá ngay trên app - Tất cả nhân viên thấy cùng lúc",
          "Đánh dấu món hết - Không nhận order món không có",
          "Thống kê món bán chạy - Nhập hàng theo nhu cầu thực tế",
          "Không cần in menu giấy, linh hoạt thay đổi giá",
        ],
      },
      {
        icon: Users,
        title: "Quản Lý Bàn",
        color: "cyan" as const,
        points: [
          "Sơ đồ bàn trực quan - Nhìn là biết bàn nào trống",
          "Đặt bàn qua app - Lưu thông tin, không quên, không trùng",
          "Gán order cho từng bàn - Biết bàn nào chi tiêu bao nhiêu",
          "Tăng hiệu suất sử dụng bàn, không còn đặt trùng",
        ],
      },
      {
        icon: Clock,
        title: "Quản Lý Phiên Làm Việc",
        color: "blue" as const,
        points: [
          "Check-in/Check-out tự động - Ghi nhận chính xác từng phút",
          "Tính toán tự động - Số giờ làm chính xác, không tranh cãi",
          "Báo cáo tổng hợp - Dễ dàng tính lương cuối tháng",
          "Quản lý lương minh bạch, rõ ràng",
        ],
      },
      {
        icon: CreditCard,
        title: "Quản Lý Thanh Toán",
        color: "green" as const,
        points: [
          "Ghi nhận mọi khoản thu - Tiền mặt, chuyển khoản, thẻ, ví điện tử",
          "Đối chiếu tự động - Tổng order vs tổng thu",
          "Thống kê thời gian thực - Biết doanh thu ngay lập tức",
          "Kiểm soát doanh thu mọi lúc",
        ],
      },
      {
        icon: Calendar,
        title: "Quản Lý Lịch Làm Việc",
        color: "cyan" as const,
        points: [
          "Xếp lịch trực quan - Kéo thả đơn giản, tự động cảnh báo trùng",
          "Nhân viên xem lịch ngay trên app - Không cần hỏi",
          "Đăng ký nghỉ phép qua app - Có lưu, có phê duyệt",
          "Xếp lịch nhanh, không còn thiếu người",
        ],
      },
      {
        icon: MapPin,
        title: "Chấm Công GPS",
        color: "blue" as const,
        points: [
          "Chấm công với GPS - Phải ở cơ sở mới chấm được",
          "Ghi nhận vị trí chính xác - Biết nhân viên ở đâu khi chấm",
          "Tính công tự động - Đúng giờ, muộn, sớm, nghỉ đều ghi nhận",
          "Chặn chấm công hộ, tiết kiệm thời gian tính công",
        ],
      },
      {
        icon: BarChart3,
        title: "Bảng Điều Khiển Tổng Quan",
        color: "blue" as const,
        points: [
          "Dashboard tổng hợp - Doanh thu, nhân sự, order trên 1 màn hình",
          "Dữ liệu thời gian thực - Biết ngay khi có thay đổi",
          "Truy cập 8 hệ thống từ 1 nơi - Không cần mở nhiều app",
          "Ra quyết định nhanh hơn với dữ liệu tập trung",
        ],
      },
      {
        icon: Shield,
        title: "Phân Quyền Theo Vai Trò",
        color: "green" as const,
        points: [
          "Phân quyền 4 cấp - CEO, Manager, Shift Leader, Staff",
          "Mỗi người chỉ thấy dữ liệu phù hợp với vai trò",
          "Bảo mật theo chi nhánh - Không xem dữ liệu chi nhánh khác",
          "An toàn dữ liệu kinh doanh",
        ],
      },
    ],

    metrics: [
      { label: "Người Dùng", value: "100+", unit: "Users", trend: "" },
      { label: "Giao Dịch", value: "5K+", unit: "Per Month", trend: "" },
      { label: "CLB Sử Dụng", value: "5+", unit: "Clubs", trend: "" },
      { label: "Trạng Thái", value: "Active", unit: "Live", trend: "" },
    ],
    barData: [
      { name: "Q1", value: 8000, target: 7000 },
      { name: "Q2", value: 15000, target: 12000 },
      { name: "Q3", value: 22000, target: 18000 },
      { name: "Q4", value: 28000, target: 25000 },
    ],
    lineData: [
      { month: "T7", users: 200, performance: 80 },
      { month: "T8", users: 300, performance: 85 },
      { month: "T9", users: 400, performance: 88 },
      { month: "T10", users: 500, performance: 92 },
      { month: "T11", users: 600, performance: 95 },
      { month: "T12", users: 700, performance: 98 },
    ],
  },

  // AINewbieVN - AI Community Platform
  {
    id: 3,
    name: "AINewbieVN",
    slug: "ainewbievn",
    description: "Cộng đồng AI & Workflow tự động hóa",
    progress: 95,
    category: "AI Platform",
    icon: Cpu,
    productionUrl: "https://www.ainewbievn.shop",
    // Enhanced sidebar fields
    status: "live",
    logoUrl: "/images/logos/ainewbievn-logo.png",

    heroTitle: "AINEWBIEVN",
    heroDescription:
      "Nền tảng sản phẩm số AI, workflow tự động hóa, và kết nối nhân tài công nghệ cho người Việt",
    heroStats: [
      { icon: Users, label: "Thành Viên", value: "500+", color: "cyan" },
      { icon: Zap, label: "Workflows", value: "50+", color: "blue" },
      { icon: Trophy, label: "Dự Án", value: "10+", color: "green" },
    ],

    overviewTitle: "Cộng Đồng AI Việt Nam",
    overviewDescription:
      "AINewbieVN là nền tảng kết nối và phát triển cộng đồng AI tại Việt Nam, cung cấp workflow tự động hóa, sản phẩm AI, và networking cho cộng đồng thành viên công nghệ.",

    objectives: [
      "Xây dựng cộng đồng AI cho người Việt",
      "Cung cấp workflows tự động hóa cho doanh nghiệp",
      "Kết nối dự án AI và nhân tài công nghệ",
      "Đào tạo và phát triển kỹ năng AI cho cộng đồng",
    ],

    impacts: [
      "500+ thành viên AI và developer tham gia cộng đồng",
      "50+ workflows giúp doanh nghiệp tiết kiệm thời gian",
      "10+ dự án AI đang được phát triển",
      "Tăng nhận thức về AI trong cộng đồng công nghệ VN",
    ],

    techNodes: [
      { id: 1, icon: Cpu, label: "React", x: 30, y: 30, color: "neon-cyan" },
      { id: 2, icon: Zap, label: "TypeScript", x: 70, y: 30, color: "neon-blue" },
      { id: 3, icon: Cloud, label: "shadcn/ui", x: 30, y: 70, color: "neon-green" },
      { id: 4, icon: Database, label: "Tailwind", x: 70, y: 70, color: "neon-cyan" },
    ],
    techConnections: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
    ],

    techStack: [
      { name: "React 18", category: "Frontend", icon: Cpu, iconifyIcon: "logos:react" },
      { name: "TypeScript", category: "Language", icon: Cpu, iconifyIcon: "logos:typescript-icon" },
      { name: "Vite", category: "Build Tool", icon: Zap, iconifyIcon: "logos:vitejs" },
      {
        name: "Tailwind CSS",
        category: "Styling",
        icon: Smartphone,
        iconifyIcon: "logos:tailwindcss-icon",
      },
      {
        name: "shadcn/ui",
        category: "UI Library",
        icon: Smartphone,
        iconifyIcon: "simple-icons:shadcnui",
      },
      {
        name: "Framer Motion",
        category: "Animation",
        icon: Zap,
        iconifyIcon: "tabler:brand-framer-motion",
      },
      { name: "Lucide Icons", category: "Icons", icon: Target, iconifyIcon: "simple-icons:lucide" },
      {
        name: "React Router",
        category: "Routing",
        icon: Target,
        iconifyIcon: "logos:react-router",
      },
    ],

    technicalDetails: {
      performance: [
        { label: "Page Load", value: "0.8s" },
        { label: "First Paint", value: "1.2s" },
        { label: "Interactive", value: "1.5s" },
        { label: "Bundle Size", value: "245 KB" },
      ],
      tools: [
        { name: "VS Code", iconifyIcon: "logos:visual-studio-code" },
        { name: "Vite", iconifyIcon: "logos:vitejs" },
        { name: "ESLint", iconifyIcon: "logos:eslint" },
        { name: "Prettier", iconifyIcon: "logos:prettier" },
        { name: "Figma", iconifyIcon: "logos:figma" },
        { name: "Git & GitHub", iconifyIcon: "logos:github-icon" },
        { name: "Vercel", iconifyIcon: "logos:vercel-icon" },
      ],
      infrastructure: [
        { label: "Hosting", value: "Vercel Edge Network" },
        { label: "CDN", value: "Vercel CDN (Global)" },
        { label: "SSL", value: "Auto SSL/TLS" },
        { label: "Deploy", value: "Auto Deploy on Push" },
        { label: "Analytics", value: "Vercel Analytics" },
        { label: "Monitoring", value: "Real-time Performance" },
      ],
    },

    features: [
      {
        icon: Cpu,
        title: "AI Technology Platform",
        color: "cyan" as const,
        points: [
          "Workflow automation với AI - Tự động hóa quy trình",
          "AI product marketplace - Kết nối sản phẩm AI",
          "Community-driven learning - Học tập cộng đồng",
          "500+ thành viên, 50+ workflows, 10+ dự án",
        ],
      },
      {
        icon: Users,
        title: "Talent Network",
        color: "blue" as const,
        points: [
          "Kết nối thành viên AI & developers",
          "Job board cho AI positions",
          "Mentorship programs - Chương trình mentor",
          "Networking events - Sự kiện kết nối",
        ],
      },
      {
        icon: Zap,
        title: "Workflow Library",
        color: "green" as const,
        points: [
          "50+ ready-to-use workflows",
          "Templates for business automation",
          "Integration với popular tools",
          "Tiết kiệm thời gian cho doanh nghiệp",
        ],
      },
      {
        icon: Database,
        title: "Knowledge Hub",
        color: "cyan" as const,
        points: [
          "Tutorials & documentation đầy đủ",
          "Best practices for AI implementation",
          "Case studies from real projects",
          "Resource library cho developers",
        ],
      },
      {
        icon: Target,
        title: "Project Showcase",
        color: "blue" as const,
        points: [
          "10+ AI projects featured",
          "Demo & code samples",
          "Collaboration opportunities",
          "Feedback từ cộng đồng thành viên",
        ],
      },
    ],

    metrics: [
      { label: "Thành Viên", value: "500+", unit: "Members", trend: "" },
      { label: "Workflows", value: "50+", unit: "Templates", trend: "" },
      { label: "Dự Án", value: "10+", unit: "Projects", trend: "" },
      { label: "Trạng Thái", value: "Active", unit: "Live", trend: "" },
    ],
    barData: [
      { name: "Q1", value: 1200, target: 1000 },
      { name: "Q2", value: 2500, target: 2000 },
      { name: "Q3", value: 3800, target: 3500 },
      { name: "Q4", value: 5000, target: 4500 },
    ],
    lineData: [
      { month: "T7", users: 800, performance: 70 },
      { month: "T8", users: 1500, performance: 75 },
      { month: "T9", users: 2500, performance: 78 },
      { month: "T10", users: 3500, performance: 82 },
      { month: "T11", users: 4200, performance: 85 },
      { month: "T12", users: 5000, performance: 88 },
    ],
  },
];
