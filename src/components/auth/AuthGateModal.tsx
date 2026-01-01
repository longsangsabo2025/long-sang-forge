/**
 * AuthGateModal - Modal yêu cầu đăng nhập trước khi sử dụng AI Chat
 * Design inspired by Lovable.dev
 */

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Logo component - có thể thay bằng logo thật
const Logo = () => (
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
    <span className="text-white font-bold text-xl">LS</span>
  </div>
);

// Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AuthGateModal({
  open,
  onOpenChange,
  onSuccess,
  title = "Start Building.",
  subtitle = "Create free account",
}: AuthGateModalProps) {
  const [loading, setLoading] = useState<"google" | "github" | "email" | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");

  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Không thể đăng nhập với Google", {
        description: error.message,
      });
      setLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading("github");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Không thể đăng nhập với GitHub", {
        description: error.message,
      });
      setLoading(null);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading("email");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success("Check your email!", {
        description: `Magic link sent to ${email}`,
      });

      setEmail("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error("Không thể gửi magic link", {
        description: error.message,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 bg-white dark:bg-slate-900 border-0 shadow-2xl">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <X className="h-5 w-5 text-slate-500" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-8">
          {/* Logo */}
          <div className="mb-6">
            <Logo />
          </div>

          {/* Header */}
          <DialogHeader className="text-left space-y-1 mb-8">
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </DialogTitle>
            <p className="text-xl text-slate-400 font-light">{subtitle}</p>
          </DialogHeader>

          {/* Auth Buttons */}
          <div className="space-y-3">
            {/* Google Button */}
            <Button
              variant="outline"
              className="w-full h-12 justify-start px-4 gap-3 text-base font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              onClick={handleGoogleLogin}
              disabled={loading !== null}
            >
              {loading === "google" ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
              <span className="flex-1 text-center">Continue with Google</span>
            </Button>

            {/* GitHub Button */}
            <Button
              variant="outline"
              className="w-full h-12 justify-start px-4 gap-3 text-base font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              onClick={handleGitHubLogin}
              disabled={loading !== null}
            >
              {loading === "github" ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitHubIcon />}
              <span className="flex-1 text-center">Continue with GitHub</span>
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">OR</span>
              </div>
            </div>

            {/* Email Button / Form */}
            <AnimatePresence mode="wait">
              {!showEmailForm ? (
                <motion.div
                  key="email-button"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Button
                    className="w-full h-12 text-base font-medium bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                    onClick={() => setShowEmailForm(true)}
                    disabled={loading !== null}
                  >
                    Continue with email
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <Label htmlFor="auth-email" className="text-slate-700 dark:text-slate-300">
                      Email address
                    </Label>
                    <Input
                      id="auth-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading !== null}
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12"
                      onClick={() => setShowEmailForm(false)}
                      disabled={loading !== null}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900"
                      disabled={loading !== null || !email.trim()}
                    >
                      {loading === "email" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Send magic link"
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-slate-500 text-center leading-relaxed">
            By continuing, you agree to the{" "}
            <a
              href="/#contact"
              className="underline hover:text-slate-700 dark:hover:text-slate-300"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/#contact"
              className="underline hover:text-slate-700 dark:hover:text-slate-300"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
