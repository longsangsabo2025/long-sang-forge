/**
 * WorkspaceIdeaChat - Embedded AI Chat for Idea Brainstorming (V2)
 * ================================================================
 * Elon Musk Style: AI-first idea generation directly in workspace
 *
 * Features:
 * - Embedded chat (not popup)
 * - Chat History sidebar - View previous conversations
 * - Auto-save ideas - After each AI response, auto summarize & save
 * - "Convert to Project" button instead of "Save Idea"
 * - Brain Selector - Use custom user brain or default Long Sang AI
 * - New Chat - Reset context for fresh brainstorming
 * - Streaming responses
 */

import { userBrainAPI } from "@/brain/lib/services/user-brain-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChatMarkdownSimple } from "@/components/chat/ChatMarkdown";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { StreamingText } from "@/components/chat/TypingText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Brain,
  History,
  Lightbulb,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Serverless Edge Function URL
const EDGE_FUNCTION_URL = "https://diexsbzqwsbpilsymnfb.supabase.co/functions/v1/sales-consultant";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  ideaId?: string;
}

interface UserBrain {
  id: string;
  name: string;
  description?: string;
  knowledgeCount: number;
}

interface WorkspaceIdeaChatProps {
  onIdeaSaved?: () => void;
  onConvertToProject?: (ideaId: string) => void;
  selectedIdea?: {
    id: string;
    title: string;
    description?: string | null;
    category?: string;
  } | null;
}

const supabaseAny = supabase as any;

const ideaPrompts = [
  { icon: Lightbulb, text: "Tôi có ý tưởng về...", color: "text-yellow-500" },
  { icon: Zap, text: "Giúp tôi brainstorm về...", color: "text-blue-500" },
  { icon: Sparkles, text: "Phân tích ý tưởng kinh doanh...", color: "text-purple-500" },
];

export function WorkspaceIdeaChat({
  onIdeaSaved,
  onConvertToProject,
  selectedIdea,
}: WorkspaceIdeaChatProps) {
  const { user } = useAuth();

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Session state
  const [sessionId, setSessionId] = useState<string>(() => uuidv4());
  const [currentIdeaId, setCurrentIdeaId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("Chat mới");

  // History state
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Brain selector state
  const [userBrains, setUserBrains] = useState<UserBrain[]>([]);
  const [selectedBrainId, setSelectedBrainId] = useState<string>("default");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load selected idea context when prop changes
  useEffect(() => {
    if (selectedIdea) {
      // Set idea context
      setCurrentIdeaId(selectedIdea.id);
      setChatTitle(selectedIdea.title);

      // Create initial context message
      const contextMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `💡 **Ý tưởng: ${selectedIdea.title}**\n\n${
          selectedIdea.description || "Chưa có mô tả"
        }\n\n---\nBạn muốn phát triển ý tưởng này như thế nào? Tôi có thể giúp bạn:\n- Phân tích điểm mạnh/yếu\n- Lên kế hoạch triển khai\n- Brainstorm thêm chi tiết`,
        timestamp: new Date(),
      };

      setMessages([contextMessage]);
      setSessionId(uuidv4());
      inputRef.current?.focus();
    }
  }, [selectedIdea]);

  // Load user brains
  useEffect(() => {
    if (!user) return;

    const loadBrains = async () => {
      try {
        const domains = await userBrainAPI.getUserDomains(user.id);
        setUserBrains(
          domains.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            knowledgeCount: d.knowledgeCount,
          }))
        );
      } catch (error) {
        console.error("Error loading brains:", error);
      }
    };

    loadBrains();
  }, [user]);

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    if (!user) return;

    setIsLoadingHistory(true);
    try {
      const chats = await userBrainAPI.getChatHistory(user.id);
      setChatHistory(
        chats.map((c) => ({
          id: c.id,
          sessionId: c.sessionId,
          title: c.title,
          messages: c.messages.map((m: any) => ({
            id: m.id || uuidv4(),
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp || Date.now()),
          })),
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }))
      );
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Save chat session to database
  const saveChatSession = useCallback(
    async (msgs: ChatMessage[], title: string) => {
      if (!user || msgs.length === 0) return;

      try {
        await supabaseAny.from("user_brain_chats").upsert(
          {
            id: sessionId,
            user_id: user.id,
            session_id: sessionId,
            title: title,
            messages: msgs.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp.toISOString(),
            })),
            domain_id: selectedBrainId !== "default" ? selectedBrainId : null,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );
      } catch (error) {
        console.error("Error saving chat session:", error);
      }
    },
    [user, sessionId, selectedBrainId]
  );

  // Auto-save idea after AI response
  const autoSaveIdea = useCallback(
    async (msgs: ChatMessage[]) => {
      // Need at least 4 messages (2 exchanges) to auto-save
      // This prevents saving casual greetings like "xin chào"
      if (!user || msgs.length < 4) return;

      // Check if conversation has substance (not just greetings)
      const userMessages = msgs.filter((m) => m.role === "user");
      const totalUserChars = userMessages.reduce((sum, m) => sum + m.content.length, 0);

      // Need at least 50 characters total from user to consider it a real brainstorm
      if (totalUserChars < 50) return;

      try {
        // Request AI to summarize the conversation
        const conversationText = msgs
          .slice(-6) // Last 6 messages for context
          .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
          .join("\n\n");

        const response = await fetch(EDGE_FUNCTION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [],
            userMessage: `Tóm tắt cuộc brainstorm thành ý tưởng ngắn gọn:

${conversationText}

Trả về JSON (chỉ JSON):
{
  "title": "Tiêu đề ngắn (max 50 ký tự)",
  "description": "Mô tả chi tiết (max 200 ký tự)",
  "category": "business|product|marketing|tech|content|other"
}`,
            customerInfo: { userId: user.id },
            source: "idea-auto-summarizer",
          }),
        });

        const data = await response.json();
        let ideaData;

        try {
          const cleanResponse = data.response.replace(/```json\n?|\n?```/g, "").trim();
          ideaData = JSON.parse(cleanResponse);
        } catch {
          ideaData = {
            title: msgs[0]?.content.slice(0, 50) || "Ý tưởng mới",
            description: msgs.slice(-1)[0]?.content.slice(0, 200) || "Ý tưởng từ brainstorm",
            category: "general",
          };
        }

        // Update or insert idea
        if (currentIdeaId) {
          // Update existing idea
          await supabaseAny
            .from("user_ideas")
            .update({
              title: ideaData.title,
              description: ideaData.description,
              category: ideaData.category || "general",
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentIdeaId);
        } else {
          // Insert new idea
          const { data: newIdea, error } = await supabaseAny
            .from("user_ideas")
            .insert({
              user_id: user.id,
              title: ideaData.title,
              description: ideaData.description,
              category: ideaData.category || "general",
              status: "exploring",
              priority: "medium",
              tags: ["ai-brainstorm", "auto-saved"],
              color: "#3B82F6",
              is_pinned: false,
            })
            .select("id")
            .single();

          if (!error && newIdea) {
            setCurrentIdeaId(newIdea.id);
          }
        }

        // Update chat title
        setChatTitle(ideaData.title);
        onIdeaSaved?.();
      } catch (error) {
        console.error("Auto-save idea error:", error);
      }
    },
    [user, currentIdeaId, onIdeaSaved]
  );

  // Send message handler
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      // Determine which brain to use
      const isBrainMode = selectedBrainId !== "default";

      let systemContext = `Bạn đang trong chế độ BRAINSTORM Ý TƯỞNG.
Hãy giúp user phát triển, phân tích, và hoàn thiện ý tưởng của họ.
Hãy đặt câu hỏi để hiểu rõ hơn và đưa ra gợi ý sáng tạo.`;

      if (isBrainMode) {
        systemContext += `\n\nBạn đang sử dụng Brain riêng của user để tham khảo kiến thức.`;
      }

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemContext },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          userMessage: input.trim(),
          customerInfo: { userId: user.id },
          source: "workspace-idea-chat",
          stream: true,
          brainDomainId: isBrainMode ? selectedBrainId : undefined,
        }),
      });

      // Handle error responses (including NO_CREDITS)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.error === "NO_CREDITS") {
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: `⚠️ **Hết lượt chat hôm nay!**\n\nBạn đã sử dụng hết ${
              errorData.credits?.limit || 0
            } lượt chat miễn phí.\n\n💡 **Để tiếp tục:**\n- Nâng cấp gói Premium để có thêm lượt\n- Hoặc chờ reset vào ngày mai\n\n[Nâng cấp ngay →](/pricing)`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          return;
        }

        throw new Error(errorData.message || "API Error");
      }

      const contentType = response.headers.get("content-type");
      let fullContent = "";

      if (contentType?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

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
                } catch {
                  // Skip parse errors
                }
              }
            }
          }
        }
      } else {
        const data = await response.json();
        fullContent = data.response || "Xin lỗi, có lỗi xảy ra.";
      }

      if (fullContent) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: fullContent,
          timestamp: new Date(),
        };
        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);

        // Only save chat session - user decides when to create idea
        await saveChatSession(finalMessages, chatTitle);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "❌ Không thể kết nối. Vui lòng thử lại!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  }, [input, isLoading, user, messages, selectedBrainId, chatTitle, saveChatSession, autoSaveIdea]);

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // New Chat - Reset conversation
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setStreamingContent("");
    setSessionId(uuidv4());
    setCurrentIdeaId(null);
    setChatTitle("Chat mới");
    toast.success("🆕 Chat mới đã sẵn sàng!", {
      description: "Bắt đầu brainstorm ý tưởng mới",
    });
    inputRef.current?.focus();
    loadChatHistory(); // Refresh history
  }, [loadChatHistory]);

  // Load a chat from history
  const handleLoadChat = useCallback((chat: ChatSession) => {
    setMessages(chat.messages);
    setSessionId(chat.sessionId);
    setChatTitle(chat.title);
    setIsHistoryOpen(false);
    toast.success(`📂 Đã mở: ${chat.title}`);
  }, []);

  // Delete chat from history
  const handleDeleteChat = useCallback(async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await userBrainAPI.deleteChat(chatId);
      setChatHistory((prev) => prev.filter((c) => c.id !== chatId));
      toast.success("🗑️ Đã xóa chat");
    } catch {
      toast.error("Không thể xóa chat");
    }
  }, []);

  // Convert to Project
  const handleConvertToProject = useCallback(async () => {
    if (!currentIdeaId) {
      toast.error("Chưa có ý tưởng để chuyển thành dự án");
      return;
    }

    onConvertToProject?.(currentIdeaId);
    toast.success("🚀 Đang chuyển ý tưởng thành dự án...");
  }, [currentIdeaId, onConvertToProject]);

  // Summarize chat as Idea - User manually triggers this
  const handleSummarizeAsIdea = useCallback(async () => {
    if (!user || messages.length < 2) {
      toast.error("Cần có ít nhất 1 cuộc hội thoại để tóm tắt");
      return;
    }

    const loadingToast = toast.loading("🤖 Đang tóm tắt ý tưởng...");

    try {
      // Request AI to summarize the conversation
      const conversationText = messages
        .slice(-8) // Last 8 messages for context
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n\n");

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          userMessage: `Tóm tắt cuộc brainstorm thành ý tưởng ngắn gọn:

${conversationText}

Trả về JSON (chỉ JSON):
{
  "title": "Tiêu đề ngắn (max 50 ký tự)",
  "description": "Mô tả chi tiết (max 200 ký tự)",
  "category": "business|product|marketing|tech|content|other"
}`,
          customerInfo: { userId: user.id },
          source: "idea-summarizer",
        }),
      });

      const data = await response.json();
      let ideaData;

      try {
        const cleanResponse = data.response.replace(/```json\n?|\n?```/g, "").trim();
        ideaData = JSON.parse(cleanResponse);
      } catch {
        ideaData = {
          title: messages[0]?.content.slice(0, 50) || "Ý tưởng mới",
          description: messages.slice(-1)[0]?.content.slice(0, 200) || "Ý tưởng từ brainstorm",
          category: "general",
        };
      }

      // Insert new idea
      const { data: newIdea, error } = await supabaseAny
        .from("user_ideas")
        .insert({
          user_id: user.id,
          title: ideaData.title,
          description: ideaData.description,
          category: ideaData.category || "general",
          status: "exploring",
          priority: "medium",
          tags: ["ai-brainstorm"],
          color: "#3B82F6",
          is_pinned: false,
        })
        .select("id")
        .single();

      toast.dismiss(loadingToast);

      if (!error && newIdea) {
        setCurrentIdeaId(newIdea.id);
        setChatTitle(ideaData.title);
        onIdeaSaved?.();
        toast.success(`✨ Đã lưu: "${ideaData.title}"`, {
          description: "Ý tưởng đã được thêm vào danh sách",
        });
      } else {
        toast.error("Không thể lưu ý tưởng");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Summarize idea error:", error);
      toast.error("Có lỗi khi tóm tắt ý tưởng");
    }
  }, [user, messages, onIdeaSaved]);

  // Quick prompt handler
  const handleQuickPrompt = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Title & Brain selector */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{chatTitle}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Select value={selectedBrainId} onValueChange={setSelectedBrainId}>
                  <SelectTrigger className="h-7 text-xs w-auto min-w-[140px] max-w-[200px]">
                    <Brain className="h-3 w-3 mr-1 flex-shrink-0" />
                    <SelectValue placeholder="Chọn Brain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        Long Sang AI
                      </span>
                    </SelectItem>
                    {userBrains.map((brain) => (
                      <SelectItem key={brain.id} value={brain.id}>
                        <span className="flex items-center gap-2">
                          <Brain className="h-3 w-3 text-purple-500" />
                          {brain.name}
                          <Badge variant="secondary" className="text-[10px] px-1">
                            {brain.knowledgeCount}
                          </Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentIdeaId && (
                  <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600">
                    ✓ Đã lưu
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* History button */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <History className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Lịch sử chat</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Lịch sử Brainstorm
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-2">
                  {isLoadingHistory ? (
                    <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
                  ) : chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Chưa có lịch sử chat</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => handleLoadChat(chat)}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors group ${
                            chat.sessionId === sessionId ? "bg-accent border-primary" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{chat.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {chat.messages.length} tin nhắn •{" "}
                                {new Date(chat.updatedAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* New Chat button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewChat}
                    disabled={messages.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Chat mới
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bắt đầu brainstorm ý tưởng mới</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Summarize as Idea button - user clicks when ready */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSummarizeAsIdea()}
                    disabled={messages.length < 2 || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Tóm tắt Ý tưởng
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tóm tắt đoạn chat thành ý tưởng cụ thể</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        {/* Messages Area */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && !isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Brainstorm ý tưởng mới</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  Chat với AI để phát triển ý tưởng. Nhấn <strong>"Tóm tắt Ý tưởng"</strong> khi
                  muốn lưu.
                </p>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {ideaPrompts.map((prompt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleQuickPrompt(prompt.text)}
                    >
                      <prompt.icon className={`h-4 w-4 ${prompt.color}`} />
                      {prompt.text}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <ChatMarkdownSimple content={message.content} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Streaming response */}
                {streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 bg-muted">
                      <StreamingText content={streamingContent} isStreaming={true} />
                    </div>
                  </motion.div>
                )}

                {/* Typing Indicator */}
                {isLoading && !streamingContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập ý tưởng hoặc câu hỏi..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-4">
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            � Lịch sử chat được lưu tự động • Nhấn "Tóm tắt Ý tưởng" để lưu ý tưởng
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
