/**
 * EnhancedStickyChat - Ultimate Open Source Edition
 *
 * Features learned from Open Source:
 * ✅ Streaming responses (real-time typing)
 * ✅ Analytics tracking
 * ✅ Persistent history
 * ✅ Smart suggestions
 * ✅ Smooth animations
 * ✅ Sound Notifications (from Papercups)
 * ✅ Quick Replies (from Rasa Webchat)
 * ✅ Proactive Popup (from Intercom/Drift)
 * ✅ Chat Transcript Export (from Zendesk)
 * ✅ Typing Indicator (from Chatwoot)
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { ChatMarkdownSimple } from "@/components/chat/ChatMarkdown";
import { ProactivePopup } from "@/components/chat/ProactivePopup";
import { DEFAULT_QUICK_REPLIES, QuickReplies } from "@/components/chat/QuickReplies";
import { SoundToggleButton, useSoundNotification } from "@/components/chat/SoundNotification";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { StreamingText } from "@/components/chat/TypingText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";
import { getChatAnalytics } from "@/services/chat-analytics";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Lightbulb,
  Maximize2,
  MessageCircle,
  Minimize2,
  MoreVertical,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface SuggestedAction {
  label: string;
  action: string;
  type: "link" | "message" | "contact";
}

const quickPrompts = [
  { icon: Lightbulb, text: "Tôi cần làm website", color: "text-yellow-500" },
  { icon: Zap, text: "Tích hợp AI chatbot", color: "text-blue-500" },
  { icon: Sparkles, text: "Tự động hóa quy trình", color: "text-purple-500" },
];

export const EnhancedStickyChat = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const { messages, setMessages, clearHistory, isLoaded } = useChatHistory("longsang_chat_desktop");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analytics = getChatAnalytics();

  // 🔊 Sound notification hook
  const { playSound, isMuted, toggleMute } = useSoundNotification();

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Track conversation start
  useEffect(() => {
    if (isLoaded && messages.length === 1) {
      analytics.trackStart("sticky-chat");
    }
  }, [isLoaded, messages.length, analytics]);

  // Hide quick replies after user sends message
  useEffect(() => {
    if (messages.length > 1) {
      setShowQuickReplies(false);
    }
  }, [messages]);

  // Handle quick reply selection
  const handleQuickReply = useCallback((message: string) => {
    setInput(message);
    // Auto-send after setting input
    setTimeout(() => {
      const fakeEvent = { key: "Enter" } as React.KeyboardEvent;
      handleSendRef.current?.();
    }, 100);
  }, []);

  // Store handleSend in ref for quick reply
  const handleSendRef = useRef<() => void>();

  // Streaming chat handler
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // Require login
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setShowQuickReplies(false);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    analytics.trackMessage("user", input.trim());
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch("/api/sales-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: input.trim(),
          customerInfo: { userId: user?.id },
          source: "sticky-chat",
          stream: true,
        }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("text/event-stream")) {
        // Handle SSE streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);

                  if (parsed.content) {
                    fullContent += parsed.content;
                    setStreamingContent(fullContent);
                  }

                  if (parsed.done && parsed.suggestedActions) {
                    setSuggestedActions(parsed.suggestedActions);
                  }
                } catch {
                  // Skip parse errors
                }
              }
            }
          }
        }

        // Add final message
        if (fullContent) {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: fullContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          analytics.trackMessage("assistant", fullContent);
          playSound(); // 🔊 Play notification sound
        }
      } else {
        // Fallback to regular response
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response || "Xin lỗi, có lỗi xảy ra.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        analytics.trackMessage("assistant", data.response);
        playSound(); // 🔊 Play notification sound

        if (data.suggestedActions) {
          setSuggestedActions(data.suggestedActions);
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "❌ Không thể kết nối. Vui lòng thử lại!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  }, [input, isLoading, user, messages, setMessages, analytics, playSound]);

  // Update ref for quick reply
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  // Handle CTA click
  const handleActionClick = useCallback(
    (action: SuggestedAction) => {
      analytics.trackCTAClick(action.type, action.label);

      if (action.type === "link") {
        window.open(action.action, "_blank");
      } else if (action.type === "message") {
        setInput(action.action);
      } else if (action.type === "contact") {
        window.location.href = action.action;
      }
      setSuggestedActions([]);
    },
    [analytics]
  );

  if (!isLoaded) return null;

  return (
    <div className="hidden lg:block fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl w-[380px] flex flex-col overflow-hidden"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/30 bg-gradient-to-r from-blue-600/10 to-cyan-500/10">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Tư Vấn AI</h3>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400"
              >
                {isStreaming ? "Đang trả lời..." : "Online 24/7"}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* 🔊 Sound Toggle - Keep visible */}
            <SoundToggleButton isMuted={isMuted} onToggle={toggleMute} />

            {/* ⋮ More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {messages.length > 1 && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        const text = messages
                          .map(
                            (m) =>
                              `[${m.timestamp.toLocaleTimeString("vi-VN")}] ${
                                m.role === "user" ? "Bạn" : "AI"
                              }: ${m.content}`
                          )
                          .join("\n\n");
                        navigator.clipboard.writeText(text);
                      }}
                    >
                      📋 Sao chép lịch sử
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const text = messages
                          .map(
                            (m) =>
                              `[${m.timestamp.toLocaleTimeString("vi-VN")}] ${
                                m.role === "user" ? "Bạn" : "AI"
                              }: ${m.content}`
                          )
                          .join("\n\n");
                        const blob = new Blob([text], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `chat-longsang-${new Date().toISOString().split("T")[0]}.txt`;
                        a.click();
                      }}
                    >
                      📥 Tải xuống
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={clearHistory}
                      className="text-destructive focus:text-destructive"
                    >
                      🗑️ Xóa lịch sử
                    </DropdownMenuItem>
                  </>
                )}
                {messages.length <= 1 && (
                  <DropdownMenuItem disabled>Chưa có tin nhắn</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Minimize/Expand */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Quick Actions */}
              <div className="p-3 border-b border-border/30">
                <div className="flex gap-2">
                  {quickPrompts.map((prompt) => (
                    <Button
                      key={prompt.text}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8 gap-1.5 hover:bg-accent/50"
                      onClick={() => setInput(prompt.text)}
                    >
                      <prompt.icon className={`w-3.5 h-3.5 ${prompt.color}`} />
                      <span className="hidden xl:inline truncate">{prompt.text}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 max-h-[350px] chat-scrollbar"
              >
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.role === "user"
                            ? "bg-primary"
                            : "bg-gradient-to-br from-blue-600 to-cyan-500"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="w-3.5 h-3.5 text-primary-foreground" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted/80 rounded-tl-sm"
                        }`}
                      >
                        <ChatMarkdownSimple
                          content={msg.content}
                          className="text-sm leading-relaxed"
                        />
                        <p className="text-[10px] opacity-50 mt-1.5">
                          {msg.timestamp.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Streaming response */}
                  {isStreaming && streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 bg-muted/80">
                        <StreamingText
                          content={streamingContent}
                          isStreaming={isStreaming}
                          className="text-sm whitespace-pre-wrap leading-relaxed"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Loading indicator - Use TypingIndicator component */}
                  <AnimatePresence>
                    {isLoading && !streamingContent && <TypingIndicator variant="dots" />}
                  </AnimatePresence>

                  {/* Suggested Actions */}
                  {suggestedActions.length > 0 && !isLoading && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => handleActionClick(action)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* 💡 Quick Replies - Show at start */}
                  {showQuickReplies && messages.length <= 1 && !isLoading && (
                    <QuickReplies
                      replies={DEFAULT_QUICK_REPLIES}
                      onSelect={handleQuickReply}
                      variant="chips"
                    />
                  )}
                </div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 bg-background/80">
                <div className="flex gap-2">
                  <Input
                    placeholder="💬 Bạn cần tư vấn gì?"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                    className="flex-1 h-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  ⌨️ Nhấn Enter để gửi • 🔊 {isMuted ? "Tắt âm" : "Có âm thanh"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Login Modal */}
      <LoginModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
};

// ============================================
// MOBILE ENHANCED CHAT WITH PROACTIVE POPUP
// ============================================
export const EnhancedMobileChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProactive, setShowProactive] = useState(true);

  return (
    <>
      {/* 🎯 Proactive Popup - Auto shows after 30 seconds */}
      {showProactive && !isOpen && (
        <ProactivePopup
          delay={30}
          message="👋 Xin chào! Bạn cần tư vấn về sản phẩm hay dịch vụ của tôi không?"
          onStartChat={() => {
            setShowProactive(false);
            setIsOpen(true);
          }}
          enabled={true}
        />
      )}

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </span>
        </div>
      </motion.button>

      {/* Full Screen Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-1.5">
                      AI Sales Consultant
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h3>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-500/10 text-emerald-400"
                    >
                      Online
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Content */}
              <div className="flex-1">
                <EnhancedMobileChatContent onRequireAuth={() => setShowAuthModal(true)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
};

// Mobile Chat Content Component
const EnhancedMobileChatContent = ({ onRequireAuth }: { onRequireAuth: () => void }) => {
  const { user } = useAuth();
  const { messages, setMessages, clearHistory } = useChatHistory("longsang_chat_mobile", true);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { playSound, isMuted, toggleMute } = useSoundNotification();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 1) setShowQuickReplies(false);
  }, [messages]);

  const handleSend = useCallback(
    async (customMessage?: string) => {
      const messageToSend = customMessage || input;
      if (!messageToSend.trim() || isLoading) return;

      if (!user) {
        onRequireAuth();
        return;
      }

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: messageToSend,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      setShowQuickReplies(false);

      try {
        const response = await fetch("/api/sales-consultant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage: messageToSend,
            source: "enhanced-mobile-chat",
          }),
        });

        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response || "Có lỗi xảy ra. Thử lại nhé!",
            timestamp: new Date(),
          },
        ]);

        playSound();

        if (data.suggestedActions?.length > 0) {
          setSuggestedActions(data.suggestedActions);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "❌ Không thể kết nối. Thử lại sau!",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, user, messages, setMessages, playSound, onRequireAuth]
  );

  const handleQuickReply = (message: string) => {
    handleSend(message);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="flex items-center justify-end px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <SoundToggleButton isMuted={isMuted} onToggle={toggleMute} />

          {/* More Options Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {messages.length > 1 && (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      const text = messages
                        .map(
                          (m) =>
                            `[${m.timestamp.toLocaleTimeString("vi-VN")}] ${
                              m.role === "user" ? "Bạn" : "AI"
                            }: ${m.content}`
                        )
                        .join("\n\n");
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    📋 Sao chép lịch sử
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const text = messages
                        .map(
                          (m) =>
                            `[${m.timestamp.toLocaleTimeString("vi-VN")}] ${
                              m.role === "user" ? "Bạn" : "AI"
                            }: ${m.content}`
                        )
                        .join("\n\n");
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `chat-longsang-${new Date().toISOString().split("T")[0]}.txt`;
                      a.click();
                    }}
                  >
                    📥 Tải xuống
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearHistory}
                    className="text-destructive focus:text-destructive"
                  >
                    🗑️ Xóa lịch sử
                  </DropdownMenuItem>
                </>
              )}
              {messages.length <= 1 && (
                <DropdownMenuItem disabled>Chưa có tin nhắn</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 chat-scrollbar">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-primary" : "bg-gradient-to-br from-blue-600 to-cyan-500"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <ChatMarkdownSimple content={msg.content} className="text-sm" />
                <p className="text-[10px] opacity-50 mt-1">
                  {msg.timestamp.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>{isLoading && <TypingIndicator variant="dots" />}</AnimatePresence>

          {/* Suggested Actions */}
          {suggestedActions.length > 0 && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 bg-muted/50 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => {
                    if (action.type === "link") window.open(action.action, "_blank");
                    else if (action.type === "message") handleQuickReply(action.action);
                    else if (action.type === "contact") window.location.href = action.action;
                    setSuggestedActions([]);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Quick Replies */}
          {showQuickReplies && messages.length <= 1 && !isLoading && (
            <QuickReplies
              replies={DEFAULT_QUICK_REPLIES}
              onSelect={handleQuickReply}
              variant="buttons"
            />
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="💬 Hỏi tôi bất cứ điều gì..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={clearHistory}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Xóa lịch sử chat
          </Button>
        )}
      </div>
    </div>
  );
};
