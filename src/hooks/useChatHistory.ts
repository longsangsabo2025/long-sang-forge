import { useCallback, useEffect, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string for localStorage
}

const MAX_MESSAGES = 50; // Giới hạn số tin nhắn lưu trữ

const WELCOME_MESSAGES: Record<string, ChatMessage> = {
  longsang_chat_desktop: {
    id: "welcome",
    role: "assistant",
    content: `Chào bạn! 👋 Tôi là Tư Vấn Viên AI của Long Sang.

🎯 **Bạn đang tìm kiếm gì?**

• Website/App cho doanh nghiệp
• Tích hợp AI thông minh
• Tự động hóa quy trình
• SEO & Marketing Online

💬 Hãy cho tôi biết nhu cầu của bạn!`,
    timestamp: new Date(),
  },
  longsang_chat_mobile: {
    id: "welcome",
    role: "assistant",
    content: `Xin chào! 👋 Tôi là Tư Vấn Viên AI.

🎯 Cho tôi biết nhu cầu của bạn:
• Website/App
• Tích hợp AI
• Tự động hóa

💬 Tôi sẵn sàng hỗ trợ! 🚀`,
    timestamp: new Date(),
  },
  longsang_chat_contact: {
    id: "welcome",
    role: "assistant",
    content: `Xin chào! 👋 Tôi là AI Trợ lý của Long Sang.

Tôi có thể giúp bạn:
• 🎯 Tư vấn về các dịch vụ (Web, AI, Automation, SEO)
• 💡 Giải đáp thắc mắc kỹ thuật
• 📋 Định hướng giải pháp phù hợp
• 💰 Ước tính chi phí sơ bộ

Hãy hỏi tôi bất cứ điều gì!`,
    timestamp: new Date(),
  },
};

const DEFAULT_WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: `Xin chào! 👋 Tôi là AI Assistant. Tôi có thể giúp gì cho bạn?`,
  timestamp: new Date(),
};

export const useChatHistory = (storageKey: string, isMobile: boolean = false) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Get welcome message based on storage key
  const getWelcomeMessage = useCallback((): ChatMessage => {
    return WELCOME_MESSAGES[storageKey] || DEFAULT_WELCOME;
  }, [storageKey]);

  // Load messages từ localStorage khi mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: StoredMessage[] = JSON.parse(stored);
        const loadedMessages: ChatMessage[] = parsed.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        // Filter out duplicate welcome messages (keep only the first one)
        const uniqueMessages = loadedMessages.filter((msg, index, arr) => {
          if (msg.id === "welcome") {
            return arr.findIndex((m) => m.id === "welcome") === index;
          }
          return true;
        });

        // Nếu có messages đã lưu, sử dụng chúng
        if (uniqueMessages.length > 0) {
          setMessages(uniqueMessages);
        } else {
          // Nếu không có, dùng welcome message
          setMessages([getWelcomeMessage()]);
        }
      } else {
        // Lần đầu - dùng welcome message
        setMessages([getWelcomeMessage()]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([getWelcomeMessage()]);
    }
    setIsLoaded(true);
  }, [storageKey, getWelcomeMessage]);

  // Save messages vào localStorage khi thay đổi
  useEffect(() => {
    if (!isLoaded) return; // Đợi load xong mới save

    try {
      // Chỉ lưu tin nhắn thực (không phải welcome)
      const messagesToStore = messages.slice(-MAX_MESSAGES);
      const storedMessages: StoredMessage[] = messagesToStore.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      }));
      localStorage.setItem(storageKey, JSON.stringify(storedMessages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [messages, storageKey, isLoaded]);

  // Add message
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    localStorage.removeItem(storageKey);
    setMessages([getWelcomeMessage()]);
  }, [storageKey, getWelcomeMessage]);

  return {
    messages,
    setMessages,
    addMessage,
    clearHistory,
    isLoaded,
  };
};
