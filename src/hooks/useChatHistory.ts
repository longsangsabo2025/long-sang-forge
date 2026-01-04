import {
  clearConversationFromDB,
  loadMessagesFromDB,
  saveMessagesToDB,
} from "@/services/chat-persistence";
import { useCallback, useEffect, useRef, useState } from "react";

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
const DEBUG = true; // Enable debug logs
const DB_SYNC_DEBOUNCE = 2000; // 2 seconds debounce for DB sync

// Debug logger
const log = (action: string, ...args: unknown[]) => {
  if (DEBUG) console.log(`[ChatHistory] ${action}`, ...args);
};

const WELCOME_MESSAGES: Record<string, ChatMessage> = {
  longsang_chat_unified: {
    id: "welcome",
    role: "assistant",
    content: `Chào bạn! 👋 Tôi là Tư Vấn Viên AI của Long Sang.

🎯 **Tôi có thể giúp bạn:**
• Website/App cho doanh nghiệp
• Tích hợp AI thông minh
• Tự động hóa quy trình
• SEO & Marketing Online

💬 Hãy cho tôi biết nhu cầu của bạn!`,
    timestamp: new Date(),
  },
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

// Helper: Parse stored messages safely
const parseStoredMessages = (stored: string | null): ChatMessage[] | null => {
  if (!stored) return null;
  try {
    const parsed: StoredMessage[] = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch {
    return null;
  }
};

// Helper: Serialize messages for storage
const serializeMessages = (messages: ChatMessage[]): string => {
  const storedMessages: StoredMessage[] = messages.slice(-MAX_MESSAGES).map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
  }));
  return JSON.stringify(storedMessages);
};

export const useChatHistory = (
  storageKey: string,
  _isMobile: boolean = false,
  userId?: string | null // Optional: for database sync
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasInitializedRef = useRef(false);
  const lastSavedRef = useRef<string>("");
  const dbSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get welcome message based on storage key
  const getWelcomeMessage = useCallback((): ChatMessage => {
    return WELCOME_MESSAGES[storageKey] || DEFAULT_WELCOME;
  }, [storageKey]);

  // Load messages from localStorage
  const loadFromStorage = useCallback(() => {
    const stored = localStorage.getItem(storageKey);
    log("Loading", { key: storageKey, hasData: !!stored });

    const loadedMessages = parseStoredMessages(stored);

    if (loadedMessages && loadedMessages.length > 0) {
      // Filter duplicate welcome messages
      const uniqueMessages = loadedMessages.filter((msg, index, arr) => {
        if (msg.id === "welcome") {
          return arr.findIndex((m) => m.id === "welcome") === index;
        }
        return true;
      });
      log("Loaded", uniqueMessages.length, "messages");
      return uniqueMessages;
    }

    log("No history, using welcome");
    return [getWelcomeMessage()];
  }, [storageKey, getWelcomeMessage]);

  // Initial load (localStorage first, then DB)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initLoad = async () => {
      // 1. Load from localStorage first (fast)
      const localMessages = loadFromStorage();
      setMessages(localMessages);
      lastSavedRef.current = serializeMessages(localMessages);
      setIsLoaded(true);

      // 2. If user is logged in, try to load from DB (may have newer data)
      if (userId && storageKey === "longsang_chat_unified") {
        log("Checking DB for newer messages...");
        try {
          const dbMessages = await loadMessagesFromDB(userId);
          if (dbMessages && dbMessages.length > 0) {
            // Only use DB messages if they have more content
            const localNonWelcome = localMessages.filter((m) => m.id !== "welcome");
            if (dbMessages.length >= localNonWelcome.length) {
              log("Using DB messages (newer/more)");
              const withWelcome = [getWelcomeMessage(), ...dbMessages];
              setMessages(withWelcome);
              // Also update localStorage
              localStorage.setItem(storageKey, serializeMessages(withWelcome));
              lastSavedRef.current = serializeMessages(withWelcome);
            }
          }
        } catch (error) {
          log("DB load failed, using localStorage");
        }
      }
    };

    initLoad();
  }, [loadFromStorage, userId, storageKey, getWelcomeMessage]);

  // Cross-tab sync: Listen for storage events (like LobeChat pattern)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      if (!e.newValue) return;

      // Don't update if this tab made the change
      if (e.newValue === lastSavedRef.current) return;

      log("Storage changed from another tab");
      const newMessages = parseStoredMessages(e.newValue);
      if (newMessages && newMessages.length > 0) {
        setMessages(newMessages);
        lastSavedRef.current = e.newValue;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey]);

  // Save to localStorage when messages change
  useEffect(() => {
    if (!isLoaded) return;

    const serialized = serializeMessages(messages);

    // Skip if nothing changed (prevents unnecessary writes)
    if (serialized === lastSavedRef.current) return;

    try {
      localStorage.setItem(storageKey, serialized);
      lastSavedRef.current = serialized;
      log("Saved", messages.length, "messages");
    } catch (error) {
      console.error("[ChatHistory] Save error:", error);
    }
  }, [messages, storageKey, isLoaded]);

  // Debounced save to DB (like Open WebUI pattern)
  useEffect(() => {
    if (!isLoaded || !userId) return;
    if (storageKey !== "longsang_chat_unified") return;

    // Only sync messages that aren't welcome
    const userMessages = messages.filter((m) => m.id !== "welcome");
    if (userMessages.length === 0) return;

    // Debounce DB sync (2 seconds after last change)
    if (dbSyncTimeoutRef.current) {
      clearTimeout(dbSyncTimeoutRef.current);
    }

    dbSyncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      try {
        // Generate title from first user message
        const firstUserMsg = userMessages.find((m) => m.role === "user");
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? "..." : "")
          : "Chat Session";

        await saveMessagesToDB(userId, userMessages, title);
        log("Synced to DB:", userMessages.length, "messages");
      } catch (error) {
        console.error("[ChatHistory] DB sync error:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);

    return () => {
      if (dbSyncTimeoutRef.current) {
        clearTimeout(dbSyncTimeoutRef.current);
      }
    };
  }, [messages, userId, storageKey, isLoaded]);

  // Add message
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Clear history
  const clearHistory = useCallback(async () => {
    // Clear localStorage
    localStorage.removeItem(storageKey);
    lastSavedRef.current = "";
    setMessages([getWelcomeMessage()]);
    log("Cleared history");

    // Clear from DB if user is logged in
    if (userId && storageKey === "longsang_chat_unified") {
      try {
        await clearConversationFromDB(userId);
        log("Cleared from DB");
      } catch (error) {
        console.error("[ChatHistory] DB clear error:", error);
      }
    }
  }, [storageKey, getWelcomeMessage, userId]);

  return {
    messages,
    setMessages,
    addMessage,
    clearHistory,
    isLoaded,
    isSyncing, // New: expose sync status
  };
};
