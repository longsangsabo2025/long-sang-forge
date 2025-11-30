/**
 * Auth Callback Page
 * Handles OAuth redirect from Supabase (Google, GitHub, etc.)
 */

import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the auth code from URL
        const hashParams = new URLSearchParams(globalThis.location.hash.substring(1));
        const queryParams = new URLSearchParams(globalThis.location.search);

        const error = queryParams.get("error") || hashParams.get("error");
        const errorDescription =
          queryParams.get("error_description") || hashParams.get("error_description");

        if (error) {
          throw new Error(errorDescription || error);
        }

        // If we have tokens in hash, Supabase will handle it automatically
        // Just wait for the session to be established
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setStatus("success");
          setMessage(`Chào mừng ${session.user.email}!`);

          // Redirect to home after short delay
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1500);
        } else {
          // No session yet, might be email confirmation
          // Try to exchange code for session
          const code = queryParams.get("code");

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              throw exchangeError;
            }

            setStatus("success");
            setMessage("Đăng nhập thành công!");

            setTimeout(() => {
              navigate("/", { replace: true });
            }, 1500);
          } else {
            // Magic link or other flow
            setStatus("success");
            setMessage("Email đã được xác nhận!");

            setTimeout(() => {
              navigate("/", { replace: true });
            }, 1500);
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Đã có lỗi xảy ra");

        // Redirect to home after showing error
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 p-8">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-lg text-muted-foreground">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-lg text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-lg text-foreground">Đăng nhập thất bại</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
