/**
 * VideoEmbed - Embed video với thumbnail và play button
 * Split từ PremiumShowcaseComponents.tsx theo Elon Musk Audit
 */
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useState } from "react";

interface VideoEmbedProps {
  videoUrl?: string;
  thumbnailUrl: string;
  title?: string;
}

export const VideoEmbed = ({ videoUrl, thumbnailUrl, title = "Video Demo" }: VideoEmbedProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border">
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold text-foreground mb-4">🎬 {title}</h3>

        <div className="relative aspect-video rounded-xl overflow-hidden">
          {!isPlaying ? (
            // Thumbnail with Play Button
            <div className="relative w-full h-full">
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <motion.button
                  onClick={() => videoUrl && setIsPlaying(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-6 rounded-full bg-primary/30 hover:bg-primary/50 backdrop-blur-md text-white shadow-2xl border border-primary/50 hover:border-primary/70 transition-all duration-300"
                >
                  <Play className="w-12 h-12 fill-current" />
                </motion.button>
              </div>
              {!videoUrl && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-sm text-white/80 bg-black/50 px-4 py-2 rounded-full">
                    Video coming soon
                  </span>
                </div>
              )}
            </div>
          ) : (
            // Video Player
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full h-full"
              >
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
