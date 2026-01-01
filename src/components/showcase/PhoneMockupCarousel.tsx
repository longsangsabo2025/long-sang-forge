/**
 * PhoneMockupCarousel - Hiển thị screenshots trong khung điện thoại đứng
 * Kết nối với project_showcase database
 */
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface PhoneMockupCarouselProps {
  screenshots: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const PhoneMockupCarousel: React.FC<PhoneMockupCarouselProps> = ({
  screenshots,
  autoPlay = true,
  autoPlayInterval = 4000,
  className = "",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <div className="flex flex-col items-center justify-center h-[500px] bg-card/30 rounded-3xl border border-border/30 border-dashed">
        <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <span className="text-3xl">📱</span>
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
        {/* Phone Frame Container */}
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

          {/* iPhone Frame */}
          <div className="relative cursor-pointer" onClick={() => setIsFullscreen(true)}>
            {/* Phone Body */}
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

              {/* Screen Container - Tăng kích thước */}
              <div className="relative w-[340px] h-[700px] bg-black rounded-[3rem] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIndex}
                    src={screenshots[activeIndex]}
                    alt={`App screenshot ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    loading="lazy"
                  />
                </AnimatePresence>

                {/* Screen Glare Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Home Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-gray-600 rounded-full" />
            </div>

            {/* Phone Shadow/Reflection */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-56 h-10 bg-gradient-to-b from-black/30 to-transparent blur-xl rounded-full" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Fullscreen Phone Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800 rounded-[3rem] p-3">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10" />
                <div className="relative w-[320px] md:w-[360px] h-[660px] md:h-[740px] bg-black rounded-[2.5rem] overflow-hidden">
                  <img
                    src={screenshots[activeIndex]}
                    alt={`Screenshot ${activeIndex + 1} fullscreen`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>

            {/* Navigation in fullscreen */}
            {screenshots.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                  className="absolute left-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                  className="absolute right-4 p-4 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PhoneMockupCarousel;
