import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createSubscription,
  generateTransferContent,
  type BillingCycle,
  type SubscriptionPlan,
} from "@/lib/api/subscriptions";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, Calendar, Check, Clock, Copy, QrCode, Shield } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Bank info - same as consultation
const BANK_INFO = {
  bankId: "ACB",
  bankName: "Ngân hàng Á Châu",
  accountNo: "10141347",
  accountName: "VO LONG SANG",
};

interface SubscriptionPaymentProps {
  plan: SubscriptionPlan;
  billingCycle?: BillingCycle;
  actualPrice?: number; // Actual price to charge (for yearly discounts)
  onComplete: () => void;
  onBack: () => void;
}

export default function SubscriptionPayment({
  plan,
  billingCycle = "monthly",
  actualPrice,
  onComplete,
  onBack,
}: SubscriptionPaymentProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isVietnamese = i18n.language === "vi";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "USER";

  // Use actual price if provided, otherwise use plan price
  const paymentAmount = actualPrice ?? plan.price;
  const isYearly = billingCycle === "yearly";

  // Generate transfer content: SUBPRO NGUYENVANA 30122025 (add Y for yearly)
  const transferContent = generateTransferContent(plan.id, userName) + (isYearly ? "Y" : "");

  // Build VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${
    BANK_INFO.accountNo
  }-compact2.png?amount=${paymentAmount}&addInfo=${encodeURIComponent(
    transferContent
  )}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      toast.success(isVietnamese ? "Đã sao chép!" : "Copied!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error(isVietnamese ? "Không thể sao chép" : "Failed to copy");
    }
  };

  const handleConfirmPayment = async () => {
    if (!user) {
      toast.error(isVietnamese ? "Vui lòng đăng nhập" : "Please login");
      return;
    }

    setLoading(true);
    try {
      // Create subscription record with pending payment
      await createSubscription(plan.id, paymentAmount, billingCycle);

      // Send notification email
      const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
      const emailHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      };

      // Notify admin about new subscription
      fetch(edgeFnUrl, {
        method: "POST",
        headers: emailHeaders,
        body: JSON.stringify({
          to: "longsangsabo@gmail.com",
          template: "adminSubscription",
          data: {
            userName,
            userEmail: user.email,
            planName: plan.name,
            planPrice: paymentAmount.toLocaleString("vi-VN"),
            billingCycle: isYearly ? "Yearly (1 year)" : "Monthly",
            duration: isYearly ? "365 days" : "30 days",
            transferContent,
          },
        }),
      }).catch((err) => console.warn("Admin email failed:", err));

      onComplete();
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(
        isVietnamese ? "Có lỗi xảy ra. Vui lòng thử lại." : "Error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header with Back Button & Plan Summary - Compact */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {isVietnamese ? "Quay lại" : "Back"}
        </Button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {isVietnamese ? "Đăng ký gói" : "Subscribe to"} {plan.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {isYearly
                ? isVietnamese
                  ? "1 năm (365 ngày)"
                  : "1 year"
                : isVietnamese
                ? "1 tháng (30 ngày)"
                : "1 month"}
            </div>
          </div>
          <Badge className="text-lg px-3 py-1.5 bg-primary/30 backdrop-blur-sm text-white font-bold border border-primary/50">
            {paymentAmount.toLocaleString("vi-VN")}đ
          </Badge>
        </div>
      </div>

      {/* Payment Section - Compact Grid */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-4 w-4 text-primary" />
          <span className="font-medium text-white">
            {isVietnamese ? "Thanh Toán Qua Chuyển Khoản" : "Bank Transfer"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          {isVietnamese ? "Quét mã QR hoặc chuyển khoản thủ công" : "Scan QR or transfer manually"}
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* QR Code - Smaller */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-lg">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/qr-placeholder.png";
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isVietnamese ? "Quét bằng app ngân hàng bất kỳ" : "Scan with any banking app"}
            </p>
          </div>

          {/* Bank Details - Compact */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {isVietnamese ? "Hoặc chuyển khoản thủ công:" : "Or transfer manually:"}
            </div>

            {/* Bank Name */}
            <div>
              <label className="text-xs text-muted-foreground">
                {isVietnamese ? "Ngân hàng" : "Bank"}
              </label>
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-md font-mono text-white">
                {BANK_INFO.bankName} ({BANK_INFO.bankId})
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="text-xs text-muted-foreground">
                {isVietnamese ? "Số tài khoản" : "Account"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 px-3 py-2 rounded-md font-mono font-bold text-white">
                  {BANK_INFO.accountNo}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  onClick={() => copyToClipboard(BANK_INFO.accountNo, "account")}
                >
                  {copied === "account" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="text-xs text-muted-foreground">
                {isVietnamese ? "Chủ tài khoản" : "Name"}
              </label>
              <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-md font-mono text-white">
                {BANK_INFO.accountName}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-muted-foreground">
                {isVietnamese ? "Số tiền" : "Amount"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-primary/20 border border-primary/30 px-3 py-2 rounded-md font-mono font-bold text-primary">
                  {paymentAmount.toLocaleString("vi-VN")} VND
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-white/10"
                  onClick={() => copyToClipboard(paymentAmount.toString(), "amount")}
                >
                  {copied === "amount" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Transfer Content - IMPORTANT */}
            <div>
              <label className="text-xs font-medium text-orange-400">
                ⚠️ {isVietnamese ? "Nội dung CK (BẮT BUỘC)" : "Content (REQUIRED)"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-orange-500/20 border border-orange-500/40 px-3 py-2 rounded-md font-mono font-bold text-orange-300">
                  {transferContent}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-orange-500/20"
                  onClick={() => copyToClipboard(transferContent, "content")}
                >
                  {copied === "content" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-confirm Notice - Minimal */}
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
        <Shield className="h-4 w-4 text-green-500 shrink-0" />
        <p className="text-xs text-green-400">
          {isVietnamese
            ? "Hệ thống tự động xác nhận & kích hoạt gói trong vài phút sau khi nhận CK."
            : "Auto-confirm & activate within minutes after transfer."}
        </p>
      </div>

      {/* Confirm Button */}
      <Button size="lg" className="w-full" onClick={handleConfirmPayment} disabled={loading}>
        {loading ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            {isVietnamese ? "Đang xử lý..." : "Processing..."}
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            {isVietnamese ? "Tôi đã chuyển khoản" : "I have transferred"}
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {isVietnamese ? "Bấm nút trên sau khi đã chuyển khoản" : "Click after successful transfer"}
      </p>
    </motion.div>
  );
}
