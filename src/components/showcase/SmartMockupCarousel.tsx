/**
 * SmartMockupCarousel - Tự động chọn loại mockup phù hợp với category
 *
 * Categories:
 * - Mobile App → Phone Mockup (iPhone style)
 * - Web App / Platform → Browser Mockup (Desktop)
 * - Website → Browser Mockup + có thể responsive preview
 * - API / Backend → Code/Terminal style
 */
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor, Smartphone, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type MockupType = "phone" | "browser" | "tablet" | "responsive";

interface SmartMockupCarouselProps {
  screenshots: string[];
  category?: string;
  displayType?: MockupType | null; // Explicit override from database
  mockupType?: MockupType; // Legacy override
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

// Auto-detect mockup type from category
const detectMockupType = (category?: string): MockupType => {
  if (!category) return "browser";

  const cat = category.toLowerCase();

  if (cat.includes("mobile") || (cat.includes("app") && !cat.includes("web"))) {
    return "phone";
  }
  if (cat.includes("tablet") || cat.includes("ipad")) {
    return "tablet";
  }
  if (cat.includes("responsive") || cat.includes("full-stack")) {
    return "responsive";
  }
  // Default to browser for web apps, platforms, websites
  return "browser";
};

export const SmartMockupCarousel: React.FC<SmartMockupCarouselProps> = ({
  screenshots,
  category,
  displayType,
  mockupType: forcedType,
  autoPlay = true,
  autoPlayInterval = 4000,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Priority: displayType (from DB) > forcedType (prop) > auto-detect (from category)
  const initialMockupType = displayType || forcedType || detectMockupType(category);
  const [currentMockupType, setCurrentMockupType] = useState<MockupType>(initialMockupType);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay || screenshots.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % screenshots.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, screenshots.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screenshots.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % screenshots.length);
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screenshots.length, isFullscreen]);

  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-card/30 rounded-3xl border border-border/30 border-dashed">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">{currentMockupType === "phone" ? "📱" : "🖥️"}</span>
        </div>
        <p className="text-muted-foreground font-medium">Chưa có screenshots</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Thêm screenshots qua Admin Panel</p>
      </div>
    );
  }

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % screenshots.length);
  const prevSlide = () =>
    setActiveIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Mockup Type Selector (for responsive) */}
        {forcedType === "responsive" || detectMockupType(category) === "responsive" ? (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setCurrentMockupType("browser")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentMockupType === "browser"
                  ? "bg-primary/30 backdrop-blur-sm text-primary-foreground border border-primary/50"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm">Desktop</span>
            </button>
            <button
              onClick={() => setCurrentMockupType("phone")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentMockupType === "phone"
                  ? "bg-primary/30 backdrop-blur-sm text-primary-foreground border border-primary/50"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-sm">Mobile</span>
            </button>
          </div>
        ) : null}

        {/* Main Mockup Container */}
        <div className="relative flex justify-center items-center">
          {/* Navigation Arrows */}
          {screenshots.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 z-20 p-3 rounded-full bg-card/80 hover:bg-card border border-border/50 text-foreground transition-all hover:scale-110 shadow-lg"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 z-20 p-3 rounded-full bg-card/80 hover:bg-card border border-border/50 text-foreground transition-all hover:scale-110 shadow-lg"
                aria-label="Next screenshot"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Render appropriate mockup */}
          <div className="cursor-pointer" onClick={() => setIsFullscreen(true)}>
            {currentMockupType === "phone" ? (
              <PhoneMockup screenshot={screenshots[activeIndex]} index={activeIndex} />
            ) : currentMockupType === "tablet" ? (
              <TabletMockup screenshot={screenshots[activeIndex]} index={activeIndex} />
            ) : (
              <BrowserMockup screenshot={screenshots[activeIndex]} index={activeIndex} />
            )}
          </div>
        </div>

        {/* Dots Indicator */}
        {screenshots.length > 1 && (
          <div className="flex gap-2 mt-8 justify-center">
            {screenshots.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="p-1"
                aria-label={`Go to screenshot ${idx + 1}`}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 h-2 bg-primary"
                      : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Counter + Keyboard hint */}
        <div className="text-center mt-4 text-sm text-muted-foreground">
          <span>
            {activeIndex + 1} / {screenshots.length}
          </span>
          <span className="hidden md:inline text-muted-foreground/50 ml-3">
            • Dùng phím ← → để chuyển
          </span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <FullscreenModal
            screenshots={screenshots}
            activeIndex={activeIndex}
            mockupType={currentMockupType}
            onClose={() => setIsFullscreen(false)}
            onNext={nextSlide}
            onPrev={prevSlide}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================
// PHONE MOCKUP (iPhone style)
// ============================================
const PhoneMockup = ({ screenshot, index }: { screenshot: string; index: number }) => (
  <div className="relative">
    <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[3.5rem] p-4 shadow-2xl shadow-black/50">
      {/* Side Buttons */}
      <div className="absolute left-[-4px] top-32 w-1.5 h-10 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-4px] top-52 w-1.5 h-14 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-4px] top-72 w-1.5 h-14 bg-gray-700 rounded-l-sm" />
      <div className="absolute right-[-4px] top-44 w-1.5 h-20 bg-gray-700 rounded-r-sm" />

      {/* Dynamic Island */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-full z-10 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-gray-800 mr-5" />
        <div className="w-3 h-3 rounded-full bg-gray-700" />
      </div>

      {/* Screen */}
      <div className="relative w-[340px] h-[700px] bg-black rounded-[3rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={screenshot}
            alt={`App screenshot ${index + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-gray-600 rounded-full" />
    </div>
    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-56 h-10 bg-gradient-to-b from-black/30 to-transparent blur-xl rounded-full" />
  </div>
);

// ============================================
// BROWSER MOCKUP (Desktop/Web App style)
// ============================================
const BrowserMockup = ({ screenshot, index }: { screenshot: string; index: number }) => (
  <div className="relative w-full max-w-4xl">
    <div className="relative bg-gray-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
      {/* Browser Top Bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-700">
        {/* Traffic lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
        </div>

        {/* URL Bar */}
        <div className="flex-1 mx-4">
          <div className="bg-gray-700 rounded-lg h-8 flex items-center px-4">
            <div className="w-4 h-4 rounded-full bg-green-500/20 mr-2 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-gray-400 font-mono truncate">
              https://your-awesome-app.com
            </span>
          </div>
        </div>

        {/* Browser actions */}
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors" />
          <div className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors" />
        </div>
      </div>

      {/* Browser Content - 16:10 aspect ratio */}
      <div className="relative aspect-[16/10] bg-gray-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={screenshot}
            alt={`Web screenshot ${index + 1}`}
            className="w-full h-full object-cover object-top"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </AnimatePresence>

        {/* Subtle reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>

    {/* Shadow/Stand effect */}
    <div className="mt-4 mx-auto w-2/3 h-2 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent rounded-full blur-sm" />
  </div>
);

// ============================================
// TABLET MOCKUP (iPad style)
// ============================================
const TabletMockup = ({ screenshot, index }: { screenshot: string; index: number }) => (
  <div className="relative">
    <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[2rem] p-3 shadow-2xl shadow-black/50">
      {/* Camera */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-700" />

      {/* Screen - 4:3 aspect ratio */}
      <div className="relative w-[600px] aspect-[4/3] bg-black rounded-[1.5rem] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={screenshot}
            alt={`Tablet screenshot ${index + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
    </div>
  </div>
);

// ============================================
// FULLSCREEN MODAL
// ============================================
const FullscreenModal = ({
  screenshots,
  activeIndex,
  mockupType,
  onClose,
  onNext,
  onPrev,
}: {
  screenshots: string[];
  activeIndex: number;
  mockupType: MockupType;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
      onClick={onClose}
      aria-label="Close fullscreen"
    >
      <X className="w-6 h-6" />
    </button>

    {/* Fullscreen Image */}
    <div className="max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
      <img
        src={screenshots[activeIndex]}
        alt={`Screenshot ${activeIndex + 1} fullscreen`}
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
      />
    </div>

    {/* Navigation */}
    {screenshots.length > 1 && (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </>
    )}
  </motion.div>
);

export default SmartMockupCarousel;
