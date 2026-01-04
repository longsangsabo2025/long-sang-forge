/**
 * ChatLayoutContext - Quản lý trạng thái chat panel
 * Khi chat mở, content co lại để nhường chỗ cho chat panel
 */

import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface ChatLayoutContextType {
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextType | undefined>(undefined);

export const ChatLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = useCallback(() => setIsChatOpen(true), []);
  const closeChat = useCallback(() => setIsChatOpen(false), []);
  const toggleChat = useCallback(() => setIsChatOpen((prev) => !prev), []);

  return (
    <ChatLayoutContext.Provider value={{ isChatOpen, openChat, closeChat, toggleChat }}>
      {children}
    </ChatLayoutContext.Provider>
  );
};

export const useChatLayout = () => {
  const context = useContext(ChatLayoutContext);
  if (!context) {
    throw new Error("useChatLayout must be used within ChatLayoutProvider");
  }
  return context;
};

// CSS class để apply cho main content khi chat mở
export const CHAT_PANEL_WIDTH = "400px";
export const CHAT_OPEN_CLASS = "chat-panel-open";
