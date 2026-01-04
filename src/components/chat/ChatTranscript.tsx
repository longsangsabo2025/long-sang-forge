/**
 * Chat Transcript - Export & Email chat history (Learned from Zendesk/Intercom)
 *
 * Features:
 * - Export as text/PDF
 * - Email transcript
 * - Copy to clipboard
 * - Download as file
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Mail, Share2 } from "lucide-react";
import { useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatTranscriptProps {
  messages: ChatMessage[];
  customerName?: string;
  className?: string;
}

// Format messages as plain text
const formatAsText = (messages: ChatMessage[], customerName?: string): string => {
  const header = `
═══════════════════════════════════════════
       LỊCH SỬ TRÒ CHUYỆN - LONGSANG.ORG
═══════════════════════════════════════════
${customerName ? `Khách hàng: ${customerName}` : ""}
Ngày: ${new Date().toLocaleDateString("vi-VN")}
Thời gian: ${new Date().toLocaleTimeString("vi-VN")}
═══════════════════════════════════════════

`;

  const body = messages
    .map((msg) => {
      const time = msg.timestamp.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const sender = msg.role === "user" ? "🧑 Bạn" : "🤖 AI Assistant";
      return `[${time}] ${sender}:\n${msg.content}\n`;
    })
    .join("\n---\n\n");

  const footer = `
═══════════════════════════════════════════
   Cảm ơn bạn đã sử dụng dịch vụ!
   Website: https://longsang.org
   Hotline: 0909.xxx.xxx
═══════════════════════════════════════════
`;

  return header + body + footer;
};

// Format messages as HTML for email
const formatAsHTML = (messages: ChatMessage[], customerName?: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #0891b2); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 18px; }
    .header p { margin: 5px 0 0; opacity: 0.9; font-size: 14px; }
    .messages { background: #f5f5f5; padding: 20px; }
    .message { background: white; padding: 12px 16px; border-radius: 12px; margin-bottom: 12px; }
    .message.user { background: #2563eb; color: white; margin-left: 20%; }
    .message.assistant { background: white; margin-right: 20%; }
    .message .sender { font-size: 12px; color: #666; margin-bottom: 4px; }
    .message.user .sender { color: rgba(255,255,255,0.8); }
    .message .content { font-size: 14px; line-height: 1.5; }
    .message .time { font-size: 11px; color: #999; margin-top: 6px; text-align: right; }
    .message.user .time { color: rgba(255,255,255,0.7); }
    .footer { background: #f0f0f0; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
    .footer a { color: #2563eb; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📝 Lịch sử trò chuyện</h1>
    <p>${customerName ? `Khách hàng: ${customerName} • ` : ""}${new Date().toLocaleDateString(
    "vi-VN"
  )}</p>
  </div>
  <div class="messages">
    ${messages
      .map(
        (msg) => `
      <div class="message ${msg.role}">
        <div class="sender">${msg.role === "user" ? "Bạn" : "AI Assistant"}</div>
        <div class="content">${msg.content.replace(/\n/g, "<br>")}</div>
        <div class="time">${msg.timestamp.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
      </div>
    `
      )
      .join("")}
  </div>
  <div class="footer">
    <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
    <p><a href="https://longsang.org">longsang.org</a> • Hotline: 0909.xxx.xxx</p>
  </div>
</body>
</html>
`;
};

export const ChatTranscript = ({ messages, customerName, className = "" }: ChatTranscriptProps) => {
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Copy to clipboard
  const handleCopy = async () => {
    const text = formatAsText(messages, customerName);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download as text file
  const handleDownload = () => {
    const text = formatAsText(messages, customerName);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-longsang-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send via email (requires Edge Function)
  const handleEmail = async () => {
    if (!email) return;

    try {
      // TODO: Create Edge Function for send-transcript
      // For now, show success with download option
      const SEND_TRANSCRIPT_URL =
        "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/send-transcript";
      const response = await fetch(SEND_TRANSCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          html: formatAsHTML(messages, customerName),
          text: formatAsText(messages, customerName),
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
          setIsDialogOpen(false);
        }, 2000);
      }
    } catch (error) {
      // Fallback: open mailto link
      const subject = encodeURIComponent("Lịch sử chat - longsang.org");
      const body = encodeURIComponent(formatAsText(messages, customerName));
      window.open(`mailto:${email}?subject=${subject}&body=${body}`);
      setIsDialogOpen(false);
    }
  };

  if (messages.length < 2) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Copy button */}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy} title="Sao chép">
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Download button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleDownload}
        title="Tải xuống"
      >
        <Download className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>

      {/* Email dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Gửi email">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gửi lịch sử chat qua email</DialogTitle>
            <DialogDescription>Nhập email để nhận bản sao cuộc trò chuyện này.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleEmail}
              disabled={!email || emailSent}
              className="bg-primary/20 backdrop-blur-sm border border-primary/40 hover:bg-primary/40 hover:border-primary/60 transition-all duration-300"
            >
              {emailSent ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Đã gửi!
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Share menu component
interface ShareMenuProps {
  messages: ChatMessage[];
  customerName?: string;
}

export const ShareMenu = ({ messages, customerName }: ShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(!isOpen)}>
        <Share2 className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-full right-0 mb-2 bg-popover border rounded-lg shadow-lg p-2 min-w-[160px]"
          >
            <ChatTranscript
              messages={messages}
              customerName={customerName}
              className="flex-col items-stretch gap-1"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
