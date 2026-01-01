import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { validateDiscountCode, type DiscountValidation } from "@/lib/api/subscription-features";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  Gift,
  Loader2,
  QrCode,
  Smartphone,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Bank info
const BANK_INFO = {
  bankId: "ACB",
  bankName: "Ngân hàng ACB",
  accountNo: "10141347",
  accountName: "VO LONG SANG",
};

interface PaymentStepProps {
  amount: number;
  bookingInfo: {
    name: string;
    email: string;
    date: string;
    time: string;
    type: string;
  };
  onPaymentConfirmed: () => void;
  onBack: () => void;
  loading?: boolean;
}

export function PaymentStep({
  amount,
  bookingInfo,
  onPaymentConfirmed,
  onBack,
  loading,
}: PaymentStepProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountValidation, setDiscountValidation] = useState<DiscountValidation | null>(null);

  // Calculate final amount after discount
  const finalAmount = discountValidation?.is_valid ? discountValidation.final_amount : amount;
  const discountAmount = discountValidation?.is_valid ? discountValidation.discount_value : 0;

  // Determine bonus subscription plan based on original amount (not discounted)
  const getBonusPlan = () => {
    if (amount >= 999000) return { plan: "VIP", isVIP: true };
    if (amount >= 299000) return { plan: "Pro", isVIP: false };
    return null;
  };
  const bonusInfo = getBonusPlan();

  // Handle discount code apply
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    // Use "consultation" as plan ID for consultation bookings
    const result = await validateDiscountCode(discountCode, "consultation", "monthly", amount);
    setDiscountValidation(result);
    setDiscountLoading(false);

    if (result.is_valid) {
      toast.success(t("subscription.discountCode.success", "Áp dụng mã giảm giá thành công!"));
    }
  };

  const handleClearDiscount = () => {
    setDiscountCode("");
    setDiscountValidation(null);
  };

  // Generate transfer content
  const transferContent = `TUVAN ${bookingInfo.name
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 10)} ${bookingInfo.date.replace(/\//g, "")}`;

  // Generate VietQR URL with final amount (after discount) and transfer content
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${
    BANK_INFO.accountNo
  }-compact2.png?amount=${finalAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(t("consultation.bookingForm.payment.copied"));
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{t("consultation.bookingForm.payment.title")}</h2>
        <p className="text-muted-foreground mt-2">{t("consultation.bookingForm.payment.scanQR")}</p>
      </div>

      {/* Discount Code Input */}
      <Card className="border-dashed">
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyDiscount();
                  }
                }}
                placeholder={t("subscription.discountCode.placeholder", "Nhập mã giảm giá")}
                className={cn(
                  "pl-9 uppercase",
                  discountValidation?.is_valid && "border-green-500 focus-visible:ring-green-500",
                  discountValidation &&
                    !discountValidation.is_valid &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                disabled={discountLoading || discountValidation?.is_valid}
              />
            </div>
            {discountValidation?.is_valid ? (
              <Button variant="outline" size="icon" onClick={handleClearDiscount}>
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleApplyDiscount}
                disabled={!discountCode.trim() || discountLoading}
              >
                {discountLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("subscription.discountCode.apply", "Áp dụng")
                )}
              </Button>
            )}
          </div>

          {discountValidation && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-md",
                discountValidation.is_valid
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
              )}
            >
              {discountValidation.is_valid ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>
                    Giảm giá: <strong>-{discountAmount.toLocaleString("vi-VN")}đ</strong>
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>{discountValidation.error_message}</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">
              {t("consultation.bookingForm.payment.scanQR")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <img src={qrUrl} alt="QR Payment" className="w-64 h-64 object-contain" />
            </div>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span>Momo, ViettelPay, ZaloPay, Banking App...</span>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {t("consultation.bookingForm.payment.bankInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Name */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("consultation.bookingForm.payment.bank")}
                </p>
                <p className="font-medium">{BANK_INFO.bankName}</p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                {BANK_INFO.bankId}
              </Badge>
            </div>

            {/* Account Number */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("consultation.bookingForm.payment.accountNumber")}
                </p>
                <p className="font-bold text-lg">{BANK_INFO.accountNo}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(BANK_INFO.accountNo, "accountNo")}
              >
                {copied === "accountNo" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Account Name */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("consultation.bookingForm.payment.accountName")}
                </p>
                <p className="font-medium">{BANK_INFO.accountName}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(BANK_INFO.accountName, "accountName")}
              >
                {copied === "accountName" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("consultation.bookingForm.payment.amount")}
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xl text-green-600">
                    {finalAmount.toLocaleString("vi-VN")}đ
                  </p>
                  {discountAmount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">
                      {amount.toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(finalAmount.toString(), "amount")}
              >
                {copied === "amount" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Transfer Content */}
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("consultation.bookingForm.payment.transferContent")}
                </p>
                <p className="font-mono font-medium text-amber-700">{transferContent}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transferContent, "content")}
              >
                {copied === "content" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Subscription Bonus Alert */}
            {bonusInfo && (
              <div
                className={`p-4 rounded-lg border ${
                  bonusInfo.isVIP
                    ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30"
                    : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {bonusInfo.isVIP ? (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        bonusInfo.isVIP ? "text-amber-700" : "text-blue-700"
                      }`}
                    >
                      {t("consultation.bookingForm.payment.bonusTitle")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bonusInfo.isVIP
                        ? t("consultation.bookingForm.payment.bonusVIP")
                        : t("consultation.bookingForm.payment.bonusPro")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{bookingInfo.type}</span>
            </div>
            <div className="text-muted-foreground">•</div>
            <div>{bookingInfo.date}</div>
            <div className="text-muted-foreground">•</div>
            <div>{bookingInfo.time}</div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
          {t("consultation.bookingForm.payment.back")}
        </Button>
        <Button onClick={onPaymentConfirmed} className="flex-1" disabled={loading}>
          {loading ? (
            <>{t("consultation.bookingForm.payment.processing")}</>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t("consultation.bookingForm.payment.confirmPayment")}
            </>
          )}
        </Button>
      </div>

      {/* Note */}
      <p className="text-xs text-center text-muted-foreground">
        {t("consultation.bookingForm.payment.note")}
      </p>
    </div>
  );
}
