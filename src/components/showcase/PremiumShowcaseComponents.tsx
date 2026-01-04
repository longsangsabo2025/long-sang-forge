import { AnimatePresence, motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor, Play, Quote, Smartphone, Star, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

// ============================================
// ANIMATED COUNTER - Count up animation
// ============================================
interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  suffix = "",
  prefix = "",
  duration = 2,
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ============================================
// DEVICE MOCKUP - iPhone/Android frames
// ============================================
interface DeviceMockupProps {
  src: string;
  alt: string;
  device?: "iphone" | "android" | "desktop";
  className?: string;
}

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  src,
  alt,
  device = "iphone",
  className = "",
}) => {
  if (device === "desktop") {
    return (
      <div className={`relative w-full max-w-[90vw] sm:max-w-none ${className}`}>
        {/* Desktop Frame */}
        <div className="relative bg-gray-800 rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-2xl">
          {/* Top bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 rounded-t-md sm:rounded-t-lg">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 mx-2 sm:mx-4">
              <div className="bg-gray-600 rounded-md h-5 sm:h-6 flex items-center px-2 sm:px-3">
                <span className="text-[10px] sm:text-xs text-gray-400 truncate">
                  https://example.com
                </span>
              </div>
            </div>
          </div>
          {/* Screen */}
          <div className="relative overflow-hidden rounded-b-md sm:rounded-b-lg">
            <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
          </div>
        </div>
        {/* Stand - Hidden on very small screens */}
        <div className="hidden xs:block">
          <div className="w-16 sm:w-24 h-3 sm:h-4 bg-gray-700 mx-auto rounded-b-lg" />
          <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-gray-600 mx-auto rounded-b-xl" />
        </div>
      </div>
    );
  }

  // Mobile device (iPhone/Android)
  return (
    <div className={`relative w-full max-w-[85vw] sm:max-w-none ${className}`}>
      {/* Phone Frame */}
      <div className="relative bg-gray-900 rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl">
        {/* Notch/Dynamic Island */}
        {device === "iphone" && (
          <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-4 sm:h-6 bg-black rounded-full z-10" />
        )}
        {/* Screen */}
        <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-black">
          <img src={src} alt={alt} className="w-full h-auto" loading="lazy" />
        </div>
        {/* Home Indicator */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-20 sm:w-32 h-0.5 sm:h-1 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
};

// ============================================
// SCREENSHOT GALLERY WITH DEVICE MOCKUPS
// ============================================
interface PremiumScreenshotGalleryProps {
  screenshots?: string[];
  deviceType?: "iphone" | "android" | "desktop" | "mixed";
  title?: string;
}

export const PremiumScreenshotGallery: React.FC<PremiumScreenshotGalleryProps> = ({
  screenshots,
  deviceType = "iphone",
  title = "Screenshots",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!screenshots || screenshots.length === 0) return null;

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % screenshots.length);
  const prevSlide = () =>
    setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);

  const getDeviceForIndex = (index: number): "iphone" | "android" | "desktop" => {
    if (deviceType === "mixed") {
      if (index % 3 === 0) return "desktop";
      if (index % 2 === 0) return "iphone";
      return "android";
    }
    return deviceType;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="py-8 sm:py-12 px-2 sm:px-0"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <Monitor className="w-4 h-4 text-muted-foreground hidden sm:block" />
          </div>
        </div>

        {/* Main Display */}
        <div className="relative flex justify-center items-center min-h-[320px] sm:min-h-[400px] md:min-h-[500px]">
          {/* Navigation Arrows - Touch-friendly 44x44px min */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 sm:left-2 md:left-4 z-10 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-card/80 hover:bg-card border border-border/50 text-foreground transition-all hover:scale-110 touch-manipulation"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 sm:right-2 md:right-4 z-10 p-2.5 sm:p-3 min-w-[44px] min-h-[44px] rounded-full bg-card/80 hover:bg-card border border-border/50 text-foreground transition-all hover:scale-110 touch-manipulation"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Device Mockup */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer px-8 sm:px-4"
              onClick={() => setIsFullscreen(true)}
            >
              <DeviceMockup
                src={screenshots[activeIndex]}
                alt={`Screenshot ${activeIndex + 1}`}
                device={getDeviceForIndex(activeIndex)}
                className="max-w-[220px] xs:max-w-[260px] sm:max-w-[280px] md:max-w-[320px] mx-auto"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail Strip - Touch-friendly */}
        {screenshots.length > 1 && (
          <div className="flex gap-2 sm:gap-3 mt-6 sm:mt-8 justify-start sm:justify-center overflow-x-auto pb-3 px-4 sm:px-0 -mx-2 sm:mx-0 scrollbar-hide">
            {screenshots.map((src, idx) => (
              <motion.button
                key={src}
                onClick={() => setActiveIndex(idx)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 min-w-[44px] min-h-[44px] rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all touch-manipulation ${
                  idx === activeIndex
                    ? "border-primary shadow-lg shadow-primary/30"
                    : "border-border/30 opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={src}
                  alt={`Thumb ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {idx === activeIndex && (
                  <motion.div layoutId="activeThumb" className="absolute inset-0 bg-primary/20" />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Dots Indicator - Touch-friendly with padding */}
        <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 justify-center">
          {screenshots.map((src, idx) => (
            <button
              key={`dot-${src}`}
              onClick={() => setActiveIndex(idx)}
              className={`p-2 -m-1.5 touch-manipulation`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <span
                className={`block rounded-full transition-all ${
                  idx === activeIndex
                    ? "w-6 sm:w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Fullscreen Modal - Safe area aware */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 pb-safe pt-safe"
            onClick={() => setIsFullscreen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen image viewer"
          >
            <button
              className="absolute top-4 right-4 p-3 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white safe-top safe-right touch-manipulation"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={screenshots[activeIndex]}
              alt={`Screenshot ${activeIndex + 1} fullscreen view`}
              className="max-w-[95vw] sm:max-w-full max-h-[85vh] sm:max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// VIDEO EMBED SECTION
// ============================================
interface VideoEmbedProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  videoUrl,
  thumbnailUrl,
  title = "Demo Video",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl && !thumbnailUrl) return null;

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    // Simplified YouTube ID extraction
    const regExp =
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?/\s]{11})/;
    const match = regExp.exec(url);
    return match ? match[1] : null;
  };

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 sm:py-12 px-2 sm:px-0"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        {title}
      </h3>

      <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-card border border-border/50 shadow-2xl">
        {isPlaying && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${title}`}
          >
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
                <span className="text-muted-foreground">Video Demo</span>
              </div>
            )}

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/40 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/50 touch-manipulation border border-primary/50"
              >
                <Play
                  className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-0.5 sm:ml-1"
                  fill="currentColor"
                />
              </motion.div>
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// TESTIMONIALS SECTION
// ============================================
interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  title = "Khách Hàng Nói Gì",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Default testimonials if none provided
  const defaultTestimonials: Testimonial[] = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      role: "Chủ CLB Bi-a",
      company: "SABO Club",
      content:
        "App quản lý giải đấu tuyệt vời! Tiết kiệm rất nhiều thời gian cho việc tổ chức và theo dõi kết quả.",
      rating: 5,
    },
    {
      id: "2",
      name: "Trần Thị B",
      role: "Marketing Manager",
      company: "Tech Startup",
      content:
        "Website được thiết kế rất chuyên nghiệp, tốc độ load nhanh và SEO tốt. Highly recommended!",
      rating: 5,
    },
    {
      id: "3",
      name: "Lê Văn C",
      role: "Business Owner",
      content:
        "Dịch vụ tư vấn AI automation giúp công ty tiết kiệm 40% thời gian xử lý công việc hàng ngày.",
      rating: 5,
    },
  ];

  const items = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  const nextTestimonial = () => setActiveIndex((prev) => (prev + 1) % items.length);
  const prevTestimonial = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 sm:py-12 px-2 sm:px-0"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
          <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          {title}
        </h3>

        {/* Navigation */}
        {items.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={prevTestimonial}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors touch-manipulation"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors touch-manipulation"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Testimonial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl p-5 sm:p-8"
        >
          {/* Quote Icon - Hidden on mobile */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 text-primary/20 hidden sm:block">
            <Quote className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>

          {/* Rating */}
          <div
            className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4"
            aria-label={`Rating: ${items[activeIndex].rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={`star-${items[activeIndex].id}-${star}`}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  star <= items[activeIndex].rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <p className="text-base sm:text-lg text-foreground/90 mb-4 sm:mb-6 leading-relaxed pr-0 sm:pr-8">
            "{items[activeIndex].content}"
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
              {items[activeIndex].avatar ? (
                <img
                  src={items[activeIndex].avatar}
                  alt={items[activeIndex].name}
                  className="w-full h-full rounded-full object-cover"
                  loading="lazy"
                />
              ) : (
                items[activeIndex].name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm sm:text-base truncate">
                {items[activeIndex].name}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {items[activeIndex].role}
                {items[activeIndex].company && ` • ${items[activeIndex].company}`}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots - Touch-friendly */}
      {items.length > 1 && (
        <div className="flex gap-1.5 sm:gap-2 mt-4 sm:mt-6 justify-center">
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(idx)}
              className="p-2 -m-1.5 touch-manipulation"
              aria-label={`Go to testimonial ${idx + 1}`}
            >
              <span
                className={`block rounded-full transition-all ${
                  idx === activeIndex
                    ? "w-6 sm:w-8 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// ANIMATED STATS SECTION
// ============================================
interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface AnimatedStatsSectionProps {
  stats: StatItem[];
  title?: string;
}

export const AnimatedStatsSection: React.FC<AnimatedStatsSectionProps> = ({
  stats,
  title = "Số Liệu Thực Tế",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 sm:py-12 px-2 sm:px-0"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 text-center">
        {title}
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-primary/50 transition-colors group"
          >
            {stat.icon && (
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            )}
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix || ""}
                prefix={stat.prefix || ""}
              />
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================
// BEFORE/AFTER COMPARISON SLIDER
// ============================================
interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = "Trước",
  afterLabel = "Sau",
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 sm:py-12 px-2 sm:px-0"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
        So Sánh Kết Quả
      </h3>

      <div
        ref={containerRef}
        role="slider"
        aria-label="Before and after comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={sliderPosition}
        tabIndex={0}
        className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden cursor-col-resize border border-border/50 touch-pan-y"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setSliderPosition((prev) => Math.max(0, prev - 5));
          if (e.key === "ArrowRight") setSliderPosition((prev) => Math.min(100, prev + 5));
        }}
      >
        {/* After Image (Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle - Touch-friendly */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center touch-manipulation">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 rounded-full text-white text-xs sm:text-sm">
          {beforeLabel}
        </div>
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-black/50 rounded-full text-white text-xs sm:text-sm">
          {afterLabel}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// LOADING SKELETON
// ============================================
export const ProjectShowcaseSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6 sm:space-y-8 p-4 sm:p-8">
      {/* Hero Skeleton */}
      <div className="text-center space-y-3 sm:space-y-4">
        <div className="w-20 sm:w-24 h-5 sm:h-6 bg-muted rounded-full mx-auto" />
        <div className="w-3/4 h-10 sm:h-12 bg-muted rounded-lg mx-auto" />
        <div className="w-2/3 h-5 sm:h-6 bg-muted rounded-lg mx-auto" />
        <div className="w-40 sm:w-48 h-10 sm:h-12 bg-muted rounded-xl mx-auto" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-2 sm:space-y-3"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted-foreground/20 rounded-lg mx-auto" />
            <div className="w-14 sm:w-16 h-5 sm:h-6 bg-muted-foreground/20 rounded mx-auto" />
            <div className="w-16 sm:w-20 h-3 sm:h-4 bg-muted-foreground/20 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Screenshot Skeleton */}
      <div className="aspect-video bg-muted rounded-xl sm:rounded-2xl" />

      {/* Features Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-muted rounded-lg sm:rounded-xl p-4 sm:p-6 space-y-2 sm:space-y-3"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted-foreground/20 rounded-lg" />
            <div className="w-3/4 h-4 sm:h-5 bg-muted-foreground/20 rounded" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-full h-2.5 sm:h-3 bg-muted-foreground/20 rounded" />
              <div className="w-5/6 h-2.5 sm:h-3 bg-muted-foreground/20 rounded" />
              <div className="w-4/6 h-2.5 sm:h-3 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// CASE STUDY CARD
// ============================================
interface CaseStudyProps {
  problem: string;
  solution: string;
  result: string;
  metrics?: { label: string; value: string }[];
}

export const CaseStudyCard: React.FC<CaseStudyProps> = ({ problem, solution, result, metrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 sm:py-12 px-2 sm:px-0"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6 sm:mb-8">Case Study</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Problem */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-red-400 font-bold text-sm sm:text-base">1</span>
          </div>
          <h4 className="font-semibold text-red-400 mb-2 text-sm sm:text-base">Vấn Đề</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">{problem}</p>
        </div>

        {/* Solution */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-yellow-400 font-bold text-sm sm:text-base">2</span>
          </div>
          <h4 className="font-semibold text-yellow-400 mb-2 text-sm sm:text-base">Giải Pháp</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">{solution}</p>
        </div>

        {/* Result */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-4 sm:p-6 sm:col-span-2 md:col-span-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-green-400 font-bold text-sm sm:text-base">3</span>
          </div>
          <h4 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">Kết Quả</h4>
          <p className="text-xs sm:text-sm text-muted-foreground">{result}</p>
        </div>
      </div>

      {/* Metrics */}
      {metrics && metrics.length > 0 && (
        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4 text-center"
            >
              <p className="text-xl sm:text-2xl font-bold text-primary">{metric.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
