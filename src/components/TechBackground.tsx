export const TechBackground = () => {
  return (
    <>
      {/* Neural Network Background Image - Custom */}
      {/* Using scale to fill screen while maintaining quality */}
      <div className="fixed inset-0 bg-[#0a0f1a] overflow-hidden" style={{ zIndex: -30 }}>
        <img
          src="/images/backgrounds/neural-network.jpg.jpg"
          alt=""
          className="w-full h-full object-cover scale-110 origin-center"
          loading="eager"
        />
      </div>

      {/* Dark overlay for better text readability - increased opacity */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: -25 }} />

      {/* Blue tint overlay for tech feel */}
      <div className="fixed inset-0 bg-[#0a0f1a]/40" style={{ zIndex: -24 }} />

      {/* Subtle animated glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -20 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Top gradient fade - lighter */}
      <div
        className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent"
        style={{ zIndex: -10 }}
      />

      {/* Bottom gradient fade - lighter */}
      <div
        className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"
        style={{ zIndex: -10 }}
      />
    </>
  );
};
