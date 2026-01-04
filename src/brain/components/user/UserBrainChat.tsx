/**
 * User Brain Chat Component
 * =========================
 * Chat interface with personal knowledge base
 */

import { useUserBrainChat, useUserBrainDomains } from "@/brain/hooks/useUserBrain";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Brain, Loader2, Send, Sparkles, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export function UserBrainChat() {
  const { user } = useAuth();
  const { data: domains } = useUserBrainDomains();
  const { messages, isLoading, sendMessage, clearChat, lastResponse } = useUserBrainChat();

  const [input, setInput] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message, selectedDomain);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Chat Panel */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Chat với Brain</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tất cả domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả domains</SelectItem>
                  {domains?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.icon} {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {messages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearChat}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription>Hỏi bất cứ điều gì về kiến thức đã lưu trong brain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col h-[500px]">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4" />
                  <h3 className="font-medium text-lg mb-2">Bắt đầu trò chuyện</h3>
                  <p className="text-sm max-w-md">
                    Hỏi về bất cứ điều gì trong brain của bạn. AI sẽ tìm kiếm và trả lời dựa trên
                    kiến thức đã import.
                  </p>
                  <div className="grid gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Tóm tắt kiến thức quan trọng nhất")}
                    >
                      Tóm tắt kiến thức quan trọng
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInput("Có những chủ đề nào trong brain của tôi?")}
                    >
                      Liệt kê các chủ đề
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <ReactMarkdown className="prose prose-sm dark:prose-invert">
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Hỏi brain của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge References Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Nguồn kiến thức</CardTitle>
          <CardDescription>Kiến thức được sử dụng để trả lời</CardDescription>
        </CardHeader>
        <CardContent>
          {lastResponse?.knowledge && lastResponse.knowledge.length > 0 ? (
            <div className="space-y-3">
              {lastResponse.knowledge.map((k, i) => (
                <div key={k.id} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(k.similarity * 100)}% match
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-2">{k.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Gửi tin nhắn để xem kiến thức được tham chiếu</p>
            </div>
          )}

          {/* Usage Stats */}
          {lastResponse?.quota && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">Sử dụng tháng này</p>
              <div className="flex justify-between text-sm">
                <span>Queries</span>
                <span className="font-medium">
                  {lastResponse.quota.queriesUsed} / {lastResponse.quota.queriesLimit}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
