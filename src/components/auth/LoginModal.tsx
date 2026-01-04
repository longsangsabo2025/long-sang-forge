import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Google icon component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub icon component
const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

interface LoginModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
  /** URL to redirect after successful login */
  readonly redirectTo?: string;
}

const isDev = import.meta.env.DEV;

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function LoginModal({ open, onOpenChange, onSuccess, redirectTo }: LoginModalProps) {
  const { i18n } = useTranslation();
  const isVi = i18n.language === "vi";
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [authMethod, setAuthMethod] = useState<"magiclink" | "password">(
    isDev ? "password" : "magiclink"
  );

  const passwordStrength =
    authMethod === "password" && mode === "signup" ? getPasswordStrength(password) : null;

  // OAuth handlers
  const handleGoogleLogin = async () => {
    setOauthLoading("google");
    try {
      // Save redirect URL to localStorage before OAuth
      if (redirectTo) {
        localStorage.setItem("auth_redirect", redirectTo);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Google login failed", { description: error.message });
      setOauthLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setOauthLoading("github");
    try {
      // Save redirect URL to localStorage before OAuth
      if (redirectTo) {
        localStorage.setItem("auth_redirect", redirectTo);
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("GitHub login failed", { description: error.message });
      setOauthLoading(null);
    }
  };

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  // Validate password on change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (mode === "signup" && value && value.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }

    // Check confirm password match if it's been filled
    if (mode === "signup" && confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  // Validate confirm password
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (mode === "signup" && value && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (authMethod === "password" && mode === "signup" && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (authMethod === "password" && mode === "signup" && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      if (authMethod === "password") {
        // Password-based authentication (dev mode)
        if (mode === "signin") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Check if user is admin
          const userRole = data.user?.user_metadata?.role;
          const isAdmin = userRole === "admin";

          toast.success("Welcome back!", {
            description: isAdmin ? `Chào Admin! Đang chuyển đến CRM...` : `Signed in as ${email}`,
          });

          onOpenChange(false);

          // Redirect to specified URL, or admin to CRM, or call onSuccess
          if (redirectTo) {
            window.location.href = redirectTo;
            return;
          }

          if (isAdmin) {
            window.location.href = "/admin";
            return;
          }

          onSuccess?.();
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: globalThis.location.origin,
            },
          });

          if (error) throw error;

          toast.success("Account created!", {
            description: "Please check your email to verify your account.",
          });

          setMode("signin");
        }
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: globalThis.location.origin,
          },
        });

        if (error) throw error;

        toast.success("Check your email!", {
          description: `Magic link sent to ${email}`,
        });

        setEmail("");
        onOpenChange(false);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: "magic-link-signup", // Required by Supabase but not used for OTP
          options: {
            emailRedirectTo: globalThis.location.origin,
          },
        });

        if (error) throw error;

        toast.success("Check your email!", {
          description: "Confirmation link sent successfully.",
        });

        setEmail("");
        onOpenChange(false);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong";
      toast.error("Authentication failed", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin"
              ? isVi
                ? "Đăng nhập tài khoản"
                : "Sign in to your account"
              : isVi
              ? "Tạo tài khoản"
              : "Create an account"}
          </DialogTitle>
          <DialogDescription>
            {(() => {
              if (authMethod === "password")
                return isVi ? "Nhập email và mật khẩu của bạn" : "Enter your email and password";
              if (mode === "signin")
                return isVi
                  ? "Nhập email để nhận liên kết đăng nhập"
                  : "Enter your email to receive a magic link";
              return isVi
                ? "Đăng ký để truy cập hệ thống"
                : "Sign up to access the automation dashboard";
            })()}
          </DialogDescription>
        </DialogHeader>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3 border-2 border-primary/60 hover:border-primary hover:bg-primary/10 transition-all duration-200"
            onClick={handleGoogleLogin}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {isVi ? "Tiếp tục với Google" : "Continue with Google"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 gap-3"
            onClick={handleGitHubLogin}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === "github" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GitHubIcon />
            )}
            {isVi ? "Tiếp tục với GitHub" : "Continue with GitHub"}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {isVi ? "Hoặc tiếp tục với email" : "Or continue with email"}
            </span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{isVi ? "Email" : "Email"}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              onBlur={handleEmailBlur}
              required
              disabled={loading}
              autoFocus
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="text-xs">⚠</span> {emailError}
              </p>
            )}
          </div>

          {authMethod === "password" && (
            <div className="space-y-2">
              <Label htmlFor="password">{isVi ? "Mật khẩu" : "Password"}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={loading}
                  className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs">⚠</span> {passwordError}
                </p>
              )}

              {/* Password Strength Indicator */}
              {passwordStrength && password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const isActive = i < passwordStrength.score;
                      return (
                        <div
                          key={`bar-${passwordStrength.score}-${i}`}
                          className={`h-1 flex-1 rounded ${
                            isActive ? passwordStrength.color : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <p
                    className={`text-xs ${(() => {
                      if (passwordStrength.score <= 2) return "text-red-500";
                      if (passwordStrength.score === 3) return "text-yellow-500";
                      return "text-green-500";
                    })()}`}
                  >
                    {isVi ? "Độ mạnh mật khẩu: " : "Password strength: "}
                    {isVi
                      ? passwordStrength.score <= 2
                        ? "Yếu"
                        : passwordStrength.score === 3
                        ? "Trung bình"
                        : "Mạnh"
                      : passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Confirm Password (Signup Only) */}
          {authMethod === "password" && mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {isVi ? "Xác nhận mật khẩu" : "Confirm Password"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  required
                  disabled={loading}
                  className={confirmPasswordError ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs">⚠</span> {confirmPasswordError}
                </p>
              )}
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          {authMethod === "password" && mode === "signin" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {isVi ? "Ghi nhớ đăng nhập" : "Remember me"}
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  toast.info(isVi ? "Quên mật khẩu?" : "Forgot password?", {
                    description: isVi
                      ? "Vui lòng liên hệ hỗ trợ để đặt lại mật khẩu."
                      : "Please contact support for password reset assistance.",
                    duration: 5000,
                  });
                }}
              >
                {isVi ? "Quên mật khẩu?" : "Forgot password?"}
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {authMethod === "password"
                  ? isVi
                    ? "Đang đăng nhập..."
                    : "Signing in..."
                  : isVi
                  ? "Đang gửi liên kết..."
                  : "Sending magic link..."}
              </>
            ) : (
              <>
                {authMethod === "password" ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {mode === "signin"
                      ? isVi
                        ? "Đăng nhập"
                        : "Sign in"
                      : isVi
                      ? "Đăng ký"
                      : "Sign up"}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {mode === "signin"
                      ? isVi
                        ? "Gửi liên kết đăng nhập"
                        : "Send magic link"
                      : isVi
                      ? "Đăng ký qua email"
                      : "Sign up with email"}
                  </>
                )}
              </>
            )}
          </Button>

          <div className="space-y-2">
            <div className="text-center text-sm">
              {mode === "signin" ? (
                <>
                  {isVi ? "Chưa có tài khoản? " : "Don't have an account? "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    {isVi ? "Đăng ký" : "Sign up"}
                  </button>
                </>
              ) : (
                <>
                  {isVi ? "Đã có tài khoản? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-primary hover:underline"
                  >
                    {isVi ? "Đăng nhập" : "Sign in"}
                  </button>
                </>
              )}
            </div>

            {isDev && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setAuthMethod(authMethod === "password" ? "magiclink" : "password")
                  }
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  {authMethod === "password"
                    ? isVi
                      ? "Dùng liên kết đăng nhập"
                      : "Use magic link instead"
                    : isVi
                    ? "Dùng mật khẩu"
                    : "Use password instead"}
                </button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
