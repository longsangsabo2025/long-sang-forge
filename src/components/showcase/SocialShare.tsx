/**
 * SocialShare - Nút chia sẻ lên mạng xã hội
 */
import { motion } from "framer-motion";
import { Check, Copy, Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { useState } from "react";

interface SocialShareProps {
  url?: string;
  title: string;
  description?: string;
  hashtags?: string[];
  className?: string;
  variant?: "inline" | "floating" | "compact";
}

export const SocialShare = ({
  url,
  title,
  description = "",
  hashtags = ["longsang", "portfolio", "project"],
  className = "",
  variant = "inline",
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);
  const hashtagStr = hashtags.join(",");

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtagStr}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleNativeShare}
          className="p-2 rounded-lg bg-card/50 hover:bg-primary/20 border border-border/50 hover:border-primary/50 transition-all"
          title="Chia sẻ"
        >
          <Share2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
        </button>
        <button
          onClick={handleCopyLink}
          className="p-2 rounded-lg bg-card/50 hover:bg-primary/20 border border-border/50 hover:border-primary/50 transition-all"
          title={copied ? "Đã copy!" : "Copy link"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />
          )}
        </button>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 ${className}`}
      >
        <ShareButton
          href={shareLinks.facebook}
          icon={Facebook}
          label="Facebook"
          color="bg-[#1877F2]"
        />
        <ShareButton
          href={shareLinks.twitter}
          icon={Twitter}
          label="Twitter"
          color="bg-[#1DA1F2]"
        />
        <ShareButton
          href={shareLinks.linkedin}
          icon={Linkedin}
          label="LinkedIn"
          color="bg-[#0A66C2]"
        />
        <button
          onClick={handleCopyLink}
          className="p-3 rounded-full bg-card hover:bg-muted border border-border shadow-lg transition-all"
          title={copied ? "Đã copy!" : "Copy link"}
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </motion.div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-sm text-muted-foreground font-medium">Chia sẻ:</span>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] transition-colors"
        title="Chia sẻ lên Facebook"
      >
        <Facebook className="w-5 h-5" />
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-colors"
        title="Chia sẻ lên Twitter"
      >
        <Twitter className="w-5 h-5" />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] transition-colors"
        title="Chia sẻ lên LinkedIn"
      >
        <Linkedin className="w-5 h-5" />
      </a>

      <button
        onClick={handleCopyLink}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card hover:bg-muted border border-border/50 transition-colors"
        title={copied ? "Đã copy!" : "Copy link"}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-500">Đã copy!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Copy link</span>
          </>
        )}
      </button>

      {/* Native Share (Mobile) */}
      {typeof navigator !== "undefined" && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors md:hidden"
          title="Chia sẻ"
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Helper component for floating variant
const ShareButton = ({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`p-3 rounded-full ${color} text-white shadow-lg hover:scale-110 transition-transform`}
    title={`Chia sẻ lên ${label}`}
  >
    <Icon className="w-5 h-5" />
  </a>
);

export default SocialShare;
