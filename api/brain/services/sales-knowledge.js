/**
 * Long Sang Sales Knowledge Base
 * Core knowledge for AI Sales Consultant
 *
 * This file contains all product/service information
 * that AI needs to consult and sell to customers
 */

const LONG_SANG_KNOWLEDGE = {
  // Company Overview
  company: {
    name: "Long Sang",
    tagline: "AI làm việc cho bạn",
    mission:
      "Giúp doanh nghiệp Việt Nam tối ưu hóa quy trình và tăng trưởng doanh thu thông qua công nghệ AI",
    website: "longsang.org",
  },

  // Main Products & Services
  products: [
    {
      id: "cooking-oil",
      name: "Dầu ăn công nghiệp Long Sang",
      category: "Sản phẩm",
      description: "Dầu ăn chất lượng cao cho nhà hàng, khách sạn và nhà máy thực phẩm",
      benefits: [
        "Giá cạnh tranh, mua số lượng lớn giảm giá",
        "Giao hàng nhanh toàn quốc",
        "Chất lượng ổn định, đạt tiêu chuẩn ATTP",
        "Hỗ trợ thanh toán linh hoạt",
      ],
      targetCustomers: ["Nhà hàng", "Khách sạn", "Nhà máy thực phẩm", "Bếp công nghiệp"],
      cta: "Liên hệ báo giá: 0901234567",
      pricing: "Giá tùy theo số lượng đặt hàng, liên hệ để báo giá tốt nhất",
    },
    {
      id: "web-development",
      name: "Thiết kế Website & App",
      category: "Dịch vụ",
      description: "Xây dựng website, landing page, web app và mobile app chuyên nghiệp",
      benefits: [
        "Thiết kế hiện đại, chuẩn UI/UX",
        "Tích hợp AI chatbot tự động",
        "SEO-friendly, tải nhanh",
        "Bảo trì và hỗ trợ 24/7",
      ],
      technologies: ["React", "Next.js", "Flutter", "Node.js", "Supabase"],
      packages: [
        { name: "Landing Page", price: "5-10 triệu", time: "3-5 ngày" },
        { name: "Website doanh nghiệp", price: "15-30 triệu", time: "2-3 tuần" },
        { name: "Web App phức tạp", price: "50-100+ triệu", time: "1-3 tháng" },
        { name: "Mobile App", price: "80-200+ triệu", time: "2-4 tháng" },
      ],
      cta: "Tư vấn miễn phí, nhận báo giá trong 24h",
    },
    {
      id: "ai-integration",
      name: "Tích hợp AI cho doanh nghiệp",
      category: "Dịch vụ",
      description: "Đưa AI vào quy trình kinh doanh để tự động hóa và tăng hiệu suất",
      benefits: [
        "Chatbot AI trả lời khách 24/7",
        "Tự động phân loại và xử lý data",
        "AI viết content, email marketing",
        "Phân tích dữ liệu thông minh",
      ],
      useCases: [
        "Chatbot CSKH tự động",
        "AI viết mô tả sản phẩm",
        "Tự động trả lời comment/inbox",
        "Phân tích sentiment khách hàng",
      ],
      cta: "Demo miễn phí - Xem AI hoạt động thực tế",
    },
    {
      id: "seo-marketing",
      name: "SEO & Digital Marketing",
      category: "Dịch vụ",
      description: "Đưa website lên top Google, tăng traffic và chuyển đổi",
      benefits: [
        "Audit SEO miễn phí",
        "Tối ưu on-page & technical SEO",
        "Xây dựng backlink chất lượng",
        "Content marketing chiến lược",
      ],
      packages: [
        { name: "SEO Basic", price: "5-10 triệu/tháng", features: "10 từ khóa, báo cáo tuần" },
        { name: "SEO Pro", price: "15-25 triệu/tháng", features: "30 từ khóa, content, backlink" },
        { name: "SEO Enterprise", price: "Theo yêu cầu", features: "Full-service, dedicated team" },
      ],
      cta: "Audit SEO miễn phí website của bạn",
    },
    {
      id: "automation",
      name: "Tự động hóa quy trình",
      category: "Dịch vụ",
      description: "Kết nối các hệ thống, tự động hóa công việc lặp đi lặp lại",
      benefits: [
        "Tiết kiệm 10-20 giờ/tuần",
        "Giảm sai sót do con người",
        "Tích hợp mọi phần mềm",
        "Báo cáo tự động",
      ],
      tools: ["Zapier", "n8n", "Make", "Custom Scripts"],
      examples: [
        "Đơn hàng mới → Tự động tạo invoice → Gửi email → Cập nhật CRM",
        "Form đăng ký → Thêm vào Google Sheet → Gửi email chào mừng",
        "Bài viết mới → Đăng lên Social Media tự động",
      ],
      cta: "Mô tả quy trình của bạn - Chúng tôi sẽ tư vấn giải pháp",
    },
  ],

  // Academy Courses
  academy: {
    name: "Long Sang Academy",
    description: "Học viện đào tạo công nghệ và AI thực chiến",
    courses: [
      {
        name: "AI Fundamentals",
        price: "Miễn phí",
        description: "Hiểu về AI, cách sử dụng ChatGPT, Copilot hiệu quả",
      },
      {
        name: "Web Development",
        price: "2-5 triệu",
        description: "Học làm website từ zero, React, Next.js",
      },
      {
        name: "AI for Business",
        price: "5-10 triệu",
        description: "Ứng dụng AI vào kinh doanh, marketing",
      },
    ],
    cta: "Đăng ký học thử miễn phí",
  },

  // Investment Opportunities
  investment: {
    description: "Cơ hội đầu tư vào các dự án công nghệ của Long Sang",
    opportunities: ["AI Marketplace Platform", "SaaS Products", "Cooking Oil Distribution Network"],
    minInvestment: "100 triệu VND",
    cta: "Tìm hiểu cơ hội đầu tư - Đặt lịch gặp CEO",
  },

  // Sales Techniques
  salesTips: {
    qualifyingQuestions: [
      "Bạn đang kinh doanh trong lĩnh vực nào?",
      "Vấn đề lớn nhất bạn đang gặp phải là gì?",
      "Bạn đã thử những giải pháp nào rồi?",
      "Budget và timeline dự kiến của bạn là bao nhiêu?",
      "Ai là người quyết định cuối cùng?",
    ],
    objectionHandling: {
      "Giá cao quá":
        "Tôi hiểu budget quan trọng. Để tôi phân tích ROI: với giải pháp này, bạn có thể tiết kiệm X giờ/tuần, tương đương Y triệu/tháng. Chỉ sau Z tháng là hoàn vốn.",
      "Cần suy nghĩ thêm":
        "Hoàn toàn được! Để tôi gửi bạn tài liệu chi tiết qua email. Tiện đây, có điểm nào bạn muốn tôi làm rõ thêm không?",
      "Đang dùng solution khác":
        "Thú vị! Solution đó giải quyết tốt vấn đề gì cho bạn? Có điểm nào bạn muốn cải thiện không?",
    },
    closingPhrases: [
      "Để bắt đầu, chúng ta chỉ cần [action nhỏ]. Bạn muốn tiến hành khi nào?",
      "Tôi có thể gửi proposal chi tiết cho bạn review. Email của bạn là gì?",
      "Có người nào khác trong team cần tham gia discussion này không?",
      "Bước tiếp theo là [cụ thể]. Tôi có thể đặt lịch call 15 phút vào [thời gian] được không?",
    ],
  },

  // Contact Info
  contact: {
    phone: "0901234567",
    email: "contact@longsang.org",
    facebook: "fb.com/longsang",
    zalo: "zalo.me/longsang",
  },
};

module.exports = LONG_SANG_KNOWLEDGE;
