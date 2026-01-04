/**
 * GlobalChat - Global AI Chat available everywhere
 * Side Panel mode: Khi mở, content co lại bên trái, chat chiếm bên phải
 * Mobile: Fullscreen overlay
 */

import { useAuth } from "@/components/auth/AuthProvider";
import { LoginModal } from "@/components/auth/LoginModal";
import { ChatMarkdownSimple } from "@/components/chat/ChatMarkdown";
import { DEFAULT_QUICK_REPLIES, QuickReplies } from "@/components/chat/QuickReplies";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { StreamingText } from "@/components/chat/TypingText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatHistory } from "@/hooks/useChatHistory";
import { getChatCredits, sendChatMessage } from "@/lib/api-client";
import { getChatAnalytics } from "@/services/chat-analytics";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Lightbulb,
  MessageCircle,
  PanelRightClose,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

// ===== Chat Layout Context =====
interface ChatLayoutContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextType | undefined>(undefined);

export const useChatLayout = () => {
  const context = useContext(ChatLayoutContext);
  // Return safe defaults if not in provider
  if (!context) {
    return {
      isChatOpen: false,
      openChat: () => {},
      closeChat: () => {},
      toggleChat: () => {},
    };
  }
  return context;
};

export const CHAT_PANEL_WIDTH = 420; // pixels

// ===== Chat Layout Provider & Wrapper =====
export const ChatLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(true); // Mở sẵn khi load trang
  const location = useLocation();

  // Chỉ ẩn ở admin pages
  const hiddenPaths = ["/admin"];
  const shouldHideChat = hiddenPaths.some((path) => location.pathname.startsWith(path));

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);

  return (
    <ChatLayoutContext.Provider value={{ isChatOpen, openChat, closeChat, toggleChat }}>
      {/* Main content wrapper - co lại khi chat mở */}
      <div
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginRight: isChatOpen && !shouldHideChat ? `${CHAT_PANEL_WIDTH}px` : 0,
        }}
      >
        {children}
      </div>

      {/* Chat Panel - Only render if not hidden */}
      {!shouldHideChat && <GlobalChatPanel />}
    </ChatLayoutContext.Provider>
  );
};

// ===== Floating Button =====
const ChatFloatingButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    onClick={onClick}
    className="fixed bottom-6 right-6 z-[100]"
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
      {/* Label - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap hidden sm:block"
      >
        <span className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium border border-border shadow-lg">
          Long Sang AI 💬
        </span>
      </motion.div>
    </div>
  </motion.button>
);

// ===== Chat Panel (Side Panel on Desktop, Fullscreen on Mobile) =====
const GlobalChatPanel = () => {
  const { isChatOpen, openChat, closeChat } = useChatLayout();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      {/* Floating Button - Shows when chat is closed */}
      <AnimatePresence>{!isChatOpen && <ChatFloatingButton onClick={openChat} />}</AnimatePresence>

      {/* Chat Side Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Desktop: Side Panel (fixed right, below header) */}
            <motion.div
              initial={{ x: CHAT_PANEL_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: CHAT_PANEL_WIDTH }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="hidden md:flex fixed md:top-[4.5rem] lg:top-20 bottom-0 right-0 z-[40] bg-background border-l border-border/50 shadow-2xl flex-col"
              style={{ width: `${CHAT_PANEL_WIDTH}px` }}
            >
              <GlobalChatContent
                onClose={closeChat}
                onRequireAuth={() => setShowAuthModal(true)}
                isSidePanel
              />
            </motion.div>

            {/* Mobile: Fullscreen Overlay */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed inset-0 z-[100] bg-background flex flex-col"
            >
              <GlobalChatContent
                onClose={closeChat}
                onRequireAuth={() => setShowAuthModal(true)}
                fullscreen
              />
            </motion.div>
          </>
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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

// Legacy export for backward compatibility
export const GlobalChat = () => {
  // This is now handled by ChatLayoutProvider
  // Keep for backward compatibility but it's a no-op
  return null;
};

// Full-featured Chat Content (same as EnhancedStickyChat)
const GlobalChatContent = ({
  onClose,
  onRequireAuth,
  fullscreen = false,
  isSidePanel = false,
}: {
  onClose: () => void;
  onRequireAuth: () => void;
  fullscreen?: boolean;
  isSidePanel?: boolean;
}) => {
  const { user } = useAuth();
  const { messages, setMessages, clearHistory, isLoaded, isSyncing } = useChatHistory(
    "longsang_chat_unified",
    true,
    user?.id // Pass userId for DB sync
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [credits, setCredits] = useState<{
    used: number;
    limit: number;
    remaining: number;
    plan?: string;
    label?: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const analytics = getChatAnalytics();

  // Fetch credits on mount
  useEffect(() => {
    if (user?.id) {
      getChatCredits(user.id)
        .then((data) => {
          if (data.credits_remaining !== undefined) {
            setCredits({
              used: data.credits_used as number,
              limit: data.credits_limit as number,
              remaining: data.credits_remaining as number,
              plan: data.plan as string,
              label: data.label as string,
            });
          }
        })
        .catch(console.error);
    }
  }, [user?.id]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Hide quick replies after user sends message
  useEffect(() => {
    if (messages.length > 1) setShowQuickReplies(false);
  }, [messages]);

  // Streaming chat handler
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      onRequireAuth();
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
      const result = await sendChatMessage({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        userMessage: input.trim(),
        customerInfo: { userId: user?.id },
        source: "global-chat",
      });

      // Handle out of credits
      if (result.error === "NO_CREDITS" || result.error === "OUT_OF_CREDITS") {
        setCredits({
          used: result.credits?.limit || 0,
          limit: result.credits?.limit || 0,
          remaining: 0,
        });
        const outOfCreditsMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ ${
            (result as { message?: string }).message ||
            "Bạn đã hết lượt hỏi hôm nay. Vui lòng quay lại ngày mai!"
          }`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, outOfCreditsMsg]);
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }

      // Success response
      if (result.success && result.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        analytics.trackMessage("assistant", result.response);

        if (result.suggestedActions) {
          setSuggestedActions(result.suggestedActions);
        }
        if (result.credits) {
          setCredits({
            used: result.credits.limit - result.credits.remaining,
            limit: result.credits.limit,
            remaining: result.credits.remaining,
          });
        }
      } else {
        // Error response
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ ${result.error || "Có lỗi xảy ra. Vui lòng thử lại!"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
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
  }, [input, isLoading, user, messages, setMessages, analytics, onRequireAuth]);

  // Handle CTA click
  const handleActionClick = useCallback(
    (action: SuggestedAction) => {
      analytics.trackCTAClick(action.type, action.label);

      if (action.type === "link") {
        if (action.action.startsWith("/") || action.action.startsWith("#")) {
          window.location.href = action.action;
        } else {
          window.open(action.action, "_blank");
        }
      } else if (action.type === "message") {
        // Set input and auto-send
        setInput(action.action);
        setSuggestedActions([]);
        setTimeout(() => {
          const btn = document.querySelector("[data-send-btn]") as HTMLButtonElement;
          if (btn) btn.click();
        }, 50);
        return;
      } else if (action.type === "contact") {
        window.location.href = action.action;
      }
      setSuggestedActions([]);
    },
    [analytics]
  );

  // Handle quick reply
  const handleQuickReply = useCallback((message: string) => {
    setInput(message);
    setTimeout(() => {
      const fakeEvent = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(fakeEvent);
    }, 100);
  }, []);

  if (!isLoaded) return null;

  return (
    <>
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
            <h3 className="font-semibold text-sm">Long Sang AI</h3>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400"
              >
                {isStreaming ? "Đang trả lời..." : "Online 24/7"}
              </Badge>
              {credits && (
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1.5 py-0 ${
                    credits.remaining <= Math.ceil(credits.limit * 0.1)
                      ? "bg-red-500/10 text-red-400"
                      : credits.remaining <= Math.ceil(credits.limit * 0.3)
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-blue-500/10 text-blue-400"
                  }`}
                  title={`Gói ${credits.plan?.toUpperCase() || "FREE"}: ${
                    credits.label || `${credits.limit}/ngày`
                  }`}
                >
                  {credits.remaining}/{credits.limit}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear history button - only show if has messages */}
          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={clearHistory}
              title="Xóa lịch sử"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            title={isSidePanel ? "Thu gọn" : "Đóng"}
          >
            {isSidePanel ? <PanelRightClose className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Quick Actions - hide on side panel to save space */}
      {!fullscreen && !isSidePanel && (
        <div className="p-3 border-b border-border/30">
          <div className="flex gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.text}
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-auto py-2 px-2 gap-1 hover:bg-accent/50 flex-col items-center"
                onClick={() => setInput(prompt.text)}
                title={prompt.text}
              >
                <prompt.icon className={`w-4 h-4 ${prompt.color}`} />
                <span className="text-[10px] text-center leading-tight line-clamp-2">
                  {prompt.text}
                </span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-4 chat-scrollbar ${
          fullscreen || isSidePanel ? "max-h-none" : "max-h-[350px]"
        }`}
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
                  msg.role === "user" ? "bg-primary" : "bg-gradient-to-br from-blue-600 to-cyan-500"
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
                <ChatMarkdownSimple content={msg.content} className="text-sm leading-relaxed" />
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

          {/* Loading indicator */}
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

          {/* Quick Replies */}
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
            placeholder={user ? "💬 Bạn cần tư vấn gì?" : "💬 Đăng nhập để chat..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            onFocus={() => !user && onRequireAuth()}
            disabled={isLoading}
            className="flex-1 h-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !user}
            size="icon"
            className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500"
            data-send-btn
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!user && (
          <p className="text-xs text-center text-muted-foreground mt-2">
            <button onClick={onRequireAuth} className="text-primary hover:underline">
              Đăng nhập
            </button>{" "}
            để bắt đầu chat với AI
          </p>
        )}
        {user && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">⌨️ Nhấn Enter để gửi</p>
        )}
      </div>
    </>
  );
};

export default GlobalChat;
