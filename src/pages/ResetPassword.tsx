/**
 * Reset Password Page
 * Handles password reset from email link
 *
 * @elon-audit: Essential security feature - users MUST be able to reset passwords
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Eye, EyeOff, KeyRound, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ResetPassword() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isVietnamese = i18n.language === "vi";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"ready" | "success" | "error">("ready");
  const [errorMessage, setErrorMessage] = useState("");

  // Check if we have a valid session from the reset link
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session - might need to handle the hash params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && type === "recovery") {
          // Set the session from recovery link
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
        }
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 6) {
      toast.error(
        isVietnamese ? "Mật khẩu phải có ít nhất 6 ký tự" : "Password must be at least 6 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error(isVietnamese ? "Mật khẩu xác nhận không khớp" : "Passwords do not match");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setStatus("success");
      toast.success(isVietnamese ? "Đổi mật khẩu thành công!" : "Password updated successfully!");

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || (isVietnamese ? "Có lỗi xảy ra" : "Something went wrong"));
      toast.error(err.message || (isVietnamese ? "Có lỗi xảy ra" : "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/30">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {status === "success" ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : status === "error" ? (
              <XCircle className="w-8 h-8 text-red-500" />
            ) : (
              <KeyRound className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "success"
              ? isVietnamese
                ? "Thành công!"
                : "Success!"
              : isVietnamese
              ? "Đặt lại mật khẩu"
              : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {status === "success"
              ? isVietnamese
                ? "Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng..."
                : "Your password has been updated. Redirecting..."
              : isVietnamese
              ? "Nhập mật khẩu mới của bạn"
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>

        {status === "ready" && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{isVietnamese ? "Mật khẩu mới" : "New Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {isVietnamese ? "Xác nhận mật khẩu" : "Confirm Password"}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {errorMessage && (
                <div className="text-sm text-red-500 text-center">{errorMessage}</div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isVietnamese ? "Đang xử lý..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    {isVietnamese ? "Đổi mật khẩu" : "Update Password"}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button variant="link" className="text-sm" onClick={() => navigate("/profile")}>
                  {isVietnamese ? "Quay lại hồ sơ" : "Back to Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}

        {status === "success" && (
          <CardContent className="text-center">
            <div className="animate-pulse text-sm text-muted-foreground">
              {isVietnamese ? "Đang chuyển hướng..." : "Redirecting..."}
            </div>
          </CardContent>
        )}

        {status === "error" && (
          <CardContent className="space-y-4">
            <div className="text-center text-red-500 text-sm">{errorMessage}</div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStatus("ready");
                setErrorMessage("");
              }}
            >
              {isVietnamese ? "Thử lại" : "Try Again"}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
