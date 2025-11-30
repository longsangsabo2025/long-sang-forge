import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { ReactNode, useState } from "react";

interface GatedContentProps {
  /** Content to show when user is not logged in (preview) */
  preview: ReactNode;
  /** Full content to show when user is logged in */
  children: ReactNode;
  /** Custom CTA text */
  ctaText?: string;
  /** Custom blur amount */
  blurAmount?: "sm" | "md" | "lg";
}

/**
 * GatedContent - Show preview content to guests, full content to logged-in users
 * Used for content gating strategy to increase user registrations
 */
export const GatedContent = ({
  preview,
  children,
  ctaText = "Đăng nhập để xem chi tiết",
  blurAmount = "md",
}: GatedContentProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User is logged in - show full content
  if (user) {
    return <>{children}</>;
  }

  // User is NOT logged in - show preview with gate
  const blurClass = {
    sm: "blur-[2px]",
    md: "blur-[4px]",
    lg: "blur-[6px]",
  }[blurAmount];

  return (
    <div className="relative">
      {/* Preview content with blur */}
      <div className={`${blurClass} select-none pointer-events-none`}>{preview}</div>

      {/* Overlay with CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/90 via-background/50 to-transparent">
        <div className="text-center p-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border border-primary/30 mb-3">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-3 max-w-[200px]">{ctaText}</p>
          <Button size="sm" onClick={() => setShowAuthModal(true)} className="gap-2">
            <Lock className="w-3.5 h-3.5" />
            Đăng nhập
          </Button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthGateModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Xem chi tiết"
        subtitle="Đăng nhập để xem đầy đủ thông tin"
      />
    </div>
  );
};

/**
 * GatedSection - Ẩn hoàn toàn nội dung khi chưa đăng nhập
 * Chỉ hiển thị CTA button nhỏ gọn
 */
interface GatedSectionProps {
  /** Content to show when user is logged in */
  children: ReactNode;
  /** Custom CTA text */
  ctaText?: string;
  /** Number of items being hidden (for display) */
  itemCount?: number;
  /** Alignment */
  align?: "left" | "right" | "center";
}

export const GatedSection = ({
  children,
  ctaText = "chi tiết",
  itemCount,
  align = "left",
}: GatedSectionProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // User is logged in - show full content
  if (user) {
    return <>{children}</>;
  }

  // User is NOT logged in - show CTA only (no content)
  const alignClass = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  }[align];

  return (
    <div className={`flex ${alignClass} my-2`}>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 rounded-lg transition-all group"
      >
        <Lock className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          {itemCount ? `${itemCount} ${ctaText}` : ctaText} • Đăng nhập để xem
        </span>
      </button>

      {/* Auth Modal */}
      <AuthGateModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Xem chi tiết công việc"
        subtitle="Đăng nhập để xem đầy đủ thông tin kinh nghiệm làm việc"
      />
    </div>
  );
};

/**
 * GatedList - Show first N items, gate the rest
 */
interface GatedListProps {
  items: string[];
  /** Number of items to show for free */
  freeCount?: number;
  /** Render function for each item */
  renderItem: (item: string, index: number) => ReactNode;
  /** Custom CTA text */
  ctaText?: string;
  /** Side for alignment */
  side?: "left" | "right";
}

export const GatedList = ({
  items,
  freeCount = 2,
  renderItem,
  ctaText = "Đăng nhập để xem thêm",
  side = "left",
}: GatedListProps) => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const freeItems = items.slice(0, freeCount);
  const gatedItems = items.slice(freeCount);

  return (
    <>
      {/* Free items - always visible */}
      {freeItems.map((item, index) => renderItem(item, index))}

      {/* Gated items */}
      {gatedItems.length > 0 && (
        <>
          {user ? (
            // User logged in - show all gated items
            gatedItems.map((item, index) => renderItem(item, freeCount + index))
          ) : (
            // User NOT logged in - show blurred preview with CTA
            <div className="relative mt-2">
              {/* Blurred preview of remaining items */}
              <div className="blur-[4px] select-none pointer-events-none opacity-60">
                {gatedItems.slice(0, 2).map((item, index) => renderItem(item, freeCount + index))}
              </div>

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full transition-colors group ${
                    side === "left" ? "" : "flex-row-reverse"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    +{gatedItems.length} {ctaText}
                  </span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Auth Modal */}
      <AuthGateModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        title="Xem chi tiết"
        subtitle="Đăng nhập để xem đầy đủ thông tin"
      />
    </>
  );
};

export default GatedContent;
