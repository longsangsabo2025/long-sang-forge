import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface SaveProductButtonProps {
  productSlug: string;
  productType?: "showcase" | "course" | "agent";
  className?: string;
  variant?: "default" | "icon" | "outline";
  size?: "sm" | "default" | "lg";
}

export function SaveProductButton({
  productSlug,
  productType = "showcase",
  className,
  variant = "default",
  size = "default",
}: SaveProductButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if product is saved
  const { data: isSaved } = useQuery({
    queryKey: ["saved-product", user?.id, productSlug, productType],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data } = await supabase
        .from("saved_products")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_slug", productSlug)
        .eq("product_type", productType)
        .single();
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Toggle save mutation
  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Please login first");

      if (isSaved) {
        // Remove
        const { error } = await supabase
          .from("saved_products")
          .delete()
          .eq("user_id", user.id)
          .eq("product_slug", productSlug)
          .eq("product_type", productType);
        if (error) throw error;
      } else {
        // Add
        const { error } = await supabase.from("saved_products").insert({
          user_id: user.id,
          product_slug: productSlug,
          product_type: productType,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-product", user?.id, productSlug] });
      queryClient.invalidateQueries({ queryKey: ["saved-products", user?.id] });
      toast.success(isSaved ? "Đã xóa khỏi danh sách yêu thích" : "Đã lưu vào danh sách yêu thích");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Don't show if not logged in
  if (!user) {
    return null;
  }

  const Icon = isSaved ? BookmarkCheck : Bookmark;

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("transition-colors", isSaved && "text-primary", className)}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleMutation.mutate();
        }}
        disabled={toggleMutation.isPending}
      >
        <Icon className={cn("h-5 w-5", isSaved && "fill-current")} />
      </Button>
    );
  }

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      size={size}
      className={cn("gap-2 transition-colors", isSaved && "border-primary/50", className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleMutation.mutate();
      }}
      disabled={toggleMutation.isPending}
    >
      <Icon className={cn("h-4 w-4", isSaved && "fill-current")} />
      {isSaved ? "Đã lưu" : "Lưu"}
    </Button>
  );
}
