import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SaveFeatureButtonProps {
  showcaseSlug: string;
  showcaseName: string;
  featureIndex: number;
  featureTitle: string;
  featurePoints?: string[];
  featureColor?: string;
  variant?: "icon" | "button" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SaveFeatureButton({
  showcaseSlug,
  showcaseName,
  featureIndex,
  featureTitle,
  featurePoints = [],
  featureColor,
  variant = "icon",
  size = "md",
  className = "",
}: SaveFeatureButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    user_notes: "",
    use_case: "",
    target_project: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Chưa đăng nhập");

      const { error } = await supabase.from("saved_features").insert({
        user_id: user.id,
        showcase_slug: showcaseSlug,
        showcase_name: showcaseName,
        feature_index: featureIndex,
        feature_title: featureTitle,
        feature_points: featurePoints,
        feature_color: featureColor,
        user_notes: form.user_notes || null,
        use_case: form.use_case || null,
        target_project: form.target_project || null,
        priority: form.priority,
        status: "saved",
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Bạn đã lưu tính năng này rồi");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-features"] });
      toast.success("Đã lưu vào Idea Bank!", {
        description: featureTitle,
        action: {
          label: "Xem",
          onClick: () => navigate("/workspace/ideas"),
        },
      });
      setOpen(false);
      setForm({ user_notes: "", use_case: "", target_project: "", priority: "medium" });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  // Handle button click - open dialog or show login toast
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();
    
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu idea", {
        action: {
          label: "Đăng nhập",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    setOpen(true);
  };

  // Render trigger button based on variant
  const renderTriggerButton = () => {
    if (variant === "icon") {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleButtonClick}
          className={`${sizeClasses[size]} hover:bg-purple-500/20 hover:text-purple-400 text-muted-foreground transition-colors ${className}`}
          title="Lưu vào Idea Bank"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      );
    }

    if (variant === "outline") {
      return (
        <Button variant="outline" size="sm" onClick={handleButtonClick} className={`gap-2 ${className}`}>
          <Sparkles className="h-4 w-4" />
          Lưu Idea
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={handleButtonClick} className={`gap-2 bg-purple-500 hover:bg-purple-600 ${className}`}>
        <Sparkles className="h-4 w-4" />
        Lưu vào Idea Bank
      </Button>
    );
  };

  return (
    <>
      {renderTriggerButton()}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Lưu vào Idea Bank
          </DialogTitle>
          <DialogDescription>
            Lưu "{featureTitle}" để tham khảo sau
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="p-3 bg-muted/50 rounded-lg border">
            <h4 className="font-medium text-sm">{featureTitle}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              từ {showcaseName}
            </p>
            {featurePoints.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                {featurePoints.slice(0, 3).map((point, i) => (
                  <li key={i}>• {point}</li>
                ))}
                {featurePoints.length > 3 && (
                  <li className="text-muted-foreground/50">
                    +{featurePoints.length - 3} tính năng khác...
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="notes"
                placeholder="Tại sao bạn thích tính năng này? Bạn muốn customize như thế nào?"
                value={form.user_notes}
                onChange={(e) => setForm({ ...form, user_notes: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="useCase">Use case (tùy chọn)</Label>
              <Input
                id="useCase"
                placeholder="VD: Dùng để quản lý booking cho khách sạn"
                value={form.use_case}
                onChange={(e) => setForm({ ...form, use_case: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="project">Project mục tiêu</Label>
                <Input
                  id="project"
                  placeholder="VD: Ứng dụng ABC"
                  value={form.target_project}
                  onChange={(e) => setForm({ ...form, target_project: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Độ ưu tiên</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Cao</SelectItem>
                    <SelectItem value="medium">🟡 Trung bình</SelectItem>
                    <SelectItem value="low">🟢 Thấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {saveMutation.isPending ? (
              "Đang lưu..."
            ) : (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Lưu Idea
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
