import i18n from "@/i18n/config";
import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.skills": "Skills",
    "nav.education": "Education",
    "nav.contact": "Contact",

    // Hero Section
    "hero.hello": "Hello, I'm",
    "hero.name": "VÕ LONG SANG",
    "hero.title": "Engineer & Leader",
    "hero.position": "Career Objective",
    "hero.subtitle": "",
    "hero.description":
      "Committed to continuous innovation and self-development, adapting flexibly to the evolving modern landscape to deliver sustainable value and contribute effectively to business growth.",
    "hero.contactMe": "Contact Me",
    "hero.viewWork": "View My Work",
    "hero.years": "Years Dev",
    "hero.oilGas": "Oil & Gas",
    "hero.expert": "Expert",
    "hero.businessOwner": "Business Owner",
    "hero.scrollExplore": "Scroll to explore",

    // About Section
    "about.badge": "About Me",
    "about.title": "Professional Profile",
    "about.role": "Full Stack Developer & Solo Founder",
    "about.line1": "Consulting & providing digital transformation solutions for businesses",
    "about.line2": "Building customized automation systems",
    "about.paragraph":
      "With an engineering background and business management experience, I build practical software solutions - from management systems to AI-integrated applications - helping businesses operate more efficiently.",
    "about.description2":
      "Specializing in React, TypeScript, Node.js and PostgreSQL. Building management systems, booking platforms, and business automation tools with AI integration.",
    "about.description3":
      "5+ years of engineering and business management experience. Understanding both technical and operational aspects helps me deliver solutions that truly work for end users.",
    "about.dateOfBirth": "Date of Birth",
    "about.education": "Education",
    "about.email": "Email",
    "about.location": "Location",
    "about.years": "Years of Experience",
    "about.techEngineering": "Tech & Engineering",
    "about.projects": "Projects Built",
    "about.webMobile": "Web & Mobile Apps",
    "about.clients": "Happy Clients",
    "about.industries": "Across Industries",
    "about.fullStackDev": "Full-stack Dev",
    "about.aiIntegration": "Solutions Consulting",
    "about.businessOwner": "Solo Founder",
    "about.mobileDev": "AI Automation",

    // Experience Section
    "experience.badge": "My Journey",
    "experience.title": "Professional Experience",
    "experience.description":
      "Over 5 years of diverse experience across Oil & Gas, Manufacturing, and Business Management",

    // Skills Section
    "skills.badge": "What I Know",
    "skills.title": "Skills & Expertise",
    "skills.description":
      "A comprehensive skill set combining technical engineering knowledge with business acumen",
    "skills.technical": "Technical Skills",
    "skills.software": "Software & Tools",
    "skills.competencies": "Professional Competencies",
    "skills.competenciesDesc": "Core soft skills that drive success",
    "skills.communication": "Communication",
    "skills.teamwork": "Teamwork",
    "skills.problemSolving": "Problem Solving",
    "skills.selfLearning": "Self-Learning",

    // Education Section
    "education.badge": "Learning Journey",
    "education.title": "Education & Certifications",
    "education.description": "My academic foundation and professional certifications",
    "education.educationLabel": "Education",
    "education.university": "PetroVietnam University",
    "education.degree": "Bachelor of Engineering",
    "education.majorLabel": "Major",
    "education.major": "Petroleum Refining Engineering",
    "education.periodLabel": "Duration",
    "education.gpaLabel": "GPA",
    "education.languageLabel": "Language Proficiency",
    "education.ielts": "IELTS: 5.5 (Issued by PVU)",
    "education.educationDesc":
      "Comprehensive engineering training in refining processes, plant operations, safety management, and quality control systems.",
    "education.certificationsTitle": "Certifications & Training",
    "education.continuousLearning": "Continuous Learning",
    "education.continuousLearningDesc":
      "Committed to professional development through industry certifications, safety training, and quality management systems to stay current with best practices.",

    // Contact Section
    "contact.title": "LET'S WORK TOGETHER",
    "contact.description": "Ready to start your next project? Let's create something amazing!",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.location": "Location",
    "contact.emailHint": "Click to send an email",
    "contact.phoneHint": "Available Mon-Sat 9am-6pm",
    "contact.city": "Vung Tau City",
    "contact.country": "Vietnam",
    "contact.namePlaceholder": "Your Name",
    "contact.emailPlaceholder": "Your Email",
    "contact.subjectPlaceholder": "Subject",
    "contact.messagePlaceholder": "Your Message",
    "contact.sendButton": "Send Message",
    "contact.sending": "Sending...",
    "contact.toastTitle": "Message Sent! ✨",
    "contact.toastDescription": "Thank you for reaching out. I will respond as soon as possible!",

    // Footer
    "footer.tagline": "Full-stack Developer & Business Owner",
    "footer.quickLinks": "Quick Links",
    "footer.services": "Services",
    "footer.connect": "Connect",
    "footer.downloadCV": "Download CV",
    "footer.copyright": "© 2025 Võ Long Sang. All rights reserved.",
    "footer.madeWith": "Made with",
    "footer.and": "and",
    "footer.engineeringConsult": "Engineering Consultation",
    "footer.businessDev": "Business Development",
    "footer.operationsManagement": "Operations Management",
    "footer.strategicAdvisory": "Strategic Advisory",
  },
  vi: {
    // Navigation
    "nav.home": "Trang chủ",
    "nav.about": "Về tôi",
    "nav.experience": "Kinh nghiệm",
    "nav.skills": "Kỹ năng",
    "nav.education": "Học vấn",
    "nav.contact": "Liên hệ",

    // Hero Section
    "hero.hello": "Xin chào, tôi là",
    "hero.name": "VÕ LONG SANG",
    "hero.title": "Kỹ sư & Nhà lãnh đạo",
    "hero.position": "Mục tiêu nghề nghiệp",
    "hero.subtitle": "",
    "hero.description":
      "Cam kết không ngừng đổi mới và phát triển năng lực bản thân, thích ứng linh hoạt với sự vận động của xã hội hiện đại, nhằm kiến tạo những giá trị bền vững và đóng góp thiết thực vào sự phát triển của doanh nghiệp.",
    "hero.contactMe": "Liên hệ tôi",
    "hero.viewWork": "Xem kinh nghiệm",
    "hero.years": "Năm Dev",
    "hero.oilGas": "Dầu khí",
    "hero.expert": "Kinh nghiệm",
    "hero.businessOwner": "Chủ doanh nghiệp",
    "hero.scrollExplore": "Cuộn để khám phá",

    // About Section
    "about.badge": "Về tôi",
    "about.title": "Hồ sơ chuyên môn",
    "about.role": "Full Stack Developer & Solo Founder",
    "about.line1": "Tư vấn & cung cấp giải pháp chuyển đổi số cho doanh nghiệp",
    "about.line2": "Xây dựng hệ thống tự động hóa tùy chỉnh theo nhu cầu",
    "about.paragraph":
      "Với nền tảng kỹ thuật và kinh nghiệm quản lý kinh doanh, tôi xây dựng các giải pháp phần mềm thiết thực - từ hệ thống quản lý đến ứng dụng tích hợp AI - giúp doanh nghiệp vận hành hiệu quả hơn.",
    "about.description2":
      "Chuyên về React, TypeScript, Node.js và PostgreSQL. Xây dựng hệ thống quản lý, nền tảng đặt lịch, và công cụ tự động hóa doanh nghiệp tích hợp AI.",
    "about.description3":
      "5+ năm kinh nghiệm kỹ thuật và quản lý kinh doanh. Hiểu cả khía cạnh kỹ thuật lẫn vận hành giúp tôi mang đến giải pháp thực sự hiệu quả cho người dùng cuối.",
    "about.dateOfBirth": "Ngày sinh",
    "about.education": "Học vấn",
    "about.email": "Email",
    "about.location": "Địa điểm",
    "about.years": "Năm kinh nghiệm",
    "about.techEngineering": "Công nghệ & Kỹ thuật",
    "about.projects": "Dự án đã xây dựng",
    "about.webMobile": "Ứng dụng Web & Mobile",
    "about.clients": "Khách hàng hài lòng",
    "about.industries": "Nhiều ngành nghề",
    "about.fullStackDev": "Lập trình Full-stack",
    "about.aiIntegration": "Tư vấn giải pháp",
    "about.businessOwner": "Solo Founder",
    "about.mobileDev": "AI Automation",

    // Experience Section
    "experience.badge": "Hành trình của tôi",
    "experience.title": "Kinh nghiệm nghề nghiệp",
    "experience.description":
      "Hơn 5 năm kinh nghiệm đa dạng trong lĩnh vực Dầu khí, Sản xuất và Quản lý Kinh doanh",

    // Skills Section
    "skills.badge": "Những gì tôi biết",
    "skills.title": "Kỹ năng & Chuyên môn",
    "skills.description": "Bộ kỹ năng toàn diện kết hợp kiến thức kỹ thuật với tài kinh doanh",
    "skills.technical": "Kỹ năng kỹ thuật",
    "skills.software": "Phần mềm & Công cụ",
    "skills.competencies": "Năng lực nghề nghiệp",
    "skills.competenciesDesc": "Kỹ năng mềm cốt lõi thúc đẩy thành công",
    "skills.communication": "Giao tiếp",
    "skills.teamwork": "Làm việc nhóm",
    "skills.problemSolving": "Giải quyết vấn đề",
    "skills.selfLearning": "Tự học",

    // Education Section
    "education.badge": "Hành trình học tập",
    "education.title": "Học vấn & Chứng chỉ",
    "education.description": "Nền tảng học thuật và chứng chỉ chuyên môn của tôi",
    "education.educationLabel": "Học vấn",
    "education.university": "Đại học Dầu khí Việt Nam",
    "education.degree": "Kỹ sư",
    "education.majorLabel": "Chuyên ngành",
    "education.major": "Kỹ thuật Lọc - Hóa dầu",
    "education.periodLabel": "Thời gian",
    "education.gpaLabel": "Điểm trung bình",
    "education.languageLabel": "Ngoại ngữ",
    "education.ielts": "IELTS: 5.5 (Cấp bởi PVU)",
    "education.educationDesc":
      "Được đào tạo kỹ thuật toàn diện về quy trình lọc dầu, vận hành nhà máy, quản lý an toàn và hệ thống kiểm soát chất lượng.",
    "education.certificationsTitle": "Chứng chỉ & Đào tạo",
    "education.continuousLearning": "Học tập liên tục",
    "education.continuousLearningDesc":
      "Cam kết phát triển chuyên môn thông qua các chứng chỉ ngành, đào tạo an toàn và hệ thống quản lý chất lượng để luôn cập nhật với các thực hành tốt nhất.",

    // Contact Section
    "contact.title": "HÃY HỢP TÁC CÙNG TÔI",
    "contact.description": "Sẵn sàng bắt đầu dự án mới? Hãy cùng tạo nên điều tuyệt vời!",
    "contact.email": "Email",
    "contact.phone": "Điện thoại",
    "contact.location": "Địa điểm",
    "contact.emailHint": "Nhấp để gửi email",
    "contact.phoneHint": "Liên hệ Thứ 2-7, 9h-18h",
    "contact.city": "Thành phố Vũng Tàu",
    "contact.country": "Việt Nam",
    "contact.namePlaceholder": "Tên của bạn",
    "contact.emailPlaceholder": "Email của bạn",
    "contact.subjectPlaceholder": "Tiêu đề",
    "contact.messagePlaceholder": "Nội dung tin nhắn",
    "contact.sendButton": "Gửi tin nhắn",
    "contact.sending": "Đang gửi...",
    "contact.toastTitle": "Đã gửi tin nhắn! ✨",
    "contact.toastDescription": "Cảm ơn bạn đã liên hệ. Tôi sẽ phản hồi sớm nhất có thể!",

    // Footer
    "footer.tagline": "Lập trình viên Full-stack & Chủ doanh nghiệp",
    "footer.quickLinks": "Liên kết nhanh",
    "footer.services": "Dịch vụ",
    "footer.connect": "Kết nối",
    "footer.downloadCV": "Tải CV",
    "footer.copyright": "© 2025 Võ Long Sang. Tất cả quyền được bảo lưu.",
    "footer.madeWith": "Được tạo với",
    "footer.and": "và",
    "footer.engineeringConsult": "Tư vấn kỹ thuật",
    "footer.businessDev": "Phát triển kinh doanh",
    "footer.operationsManagement": "Quản lý vận hành",
    "footer.strategicAdvisory": "Tư vấn chiến lược",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync with global i18n - read initial language from i18n
  const [language, setLanguageState] = useState<Language>((i18n.language as Language) || "vi");

  // Listen for i18n language changes (from other parts of app)
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguageState(lng as Language);
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // When CV page changes language, also update global i18n
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
