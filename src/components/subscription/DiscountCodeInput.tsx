import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateDiscountCode, type DiscountValidation } from "@/lib/api/subscription-features";
import { cn } from "@/lib/utils";
import { AlertCircle, Check, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DiscountCodeInputProps {
  planId: string;
  billingCycle: "monthly" | "yearly";
  originalAmount: number;
  onValidDiscount: (discount: DiscountValidation) => void;
  onClear: () => void;
  className?: string;
}

export function DiscountCodeInput({
  planId,
  billingCycle,
  originalAmount,
  onValidDiscount,
  onClear,
  className,
}: DiscountCodeInputProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<DiscountValidation | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    const result = await validateDiscountCode(code, planId, billingCycle, originalAmount);
    setValidation(result);
    setLoading(false);

    if (result.is_valid) {
      onValidDiscount(result);
    }
  };

  const handleClear = () => {
    setCode("");
    setValidation(null);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder={t("subscription.discountCode.placeholder", "Nhập mã giảm giá")}
            className={cn(
              "pl-9 uppercase",
              validation?.is_valid && "border-green-500 focus-visible:ring-green-500",
              validation && !validation.is_valid && "border-red-500 focus-visible:ring-red-500"
            )}
            disabled={loading || validation?.is_valid}
          />
        </div>
        {validation?.is_valid ? (
          <Button variant="outline" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleApply} disabled={!code.trim() || loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("subscription.discountCode.apply", "Áp dụng")
            )}
          </Button>
        )}
      </div>

      {validation && (
        <div
          className={cn(
            "flex items-center gap-2 text-sm p-2 rounded-md",
            validation.is_valid
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          )}
        >
          {validation.is_valid ? (
            <>
              <Check className="h-4 w-4" />
              <span>
                {t("subscription.discountCode.applied", "Giảm")}:{" "}
                <strong>-{validation.discount_value.toLocaleString("vi-VN")}đ</strong>
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>{validation.error_message}</span>
            </>
          )}
        </div>
      )}

      {/* Popular codes hint */}
      <div className="flex flex-wrap gap-1">
        {["WELCOME10", "VIP20"].map((hint) => (
          <button
            key={hint}
            onClick={() => setCode(hint)}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
            disabled={loading || validation?.is_valid}
          >
            {hint}
          </button>
        ))}
      </div>
    </div>
  );
}
