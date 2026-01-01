/**
 * Chat Components - Open Source Edition
 *
 * All chat components learned from open source projects:
 * - Chatwoot (Typing Indicator)
 * - Papercups (Sound Notifications)
 * - Intercom/Drift (Proactive Popup)
 * - Rasa Webchat (Quick Replies)
 * - Zendesk (Chat Transcript)
 */

// Core chat components
export { ChatMarkdown, ChatMarkdownSimple } from "./ChatMarkdown";
export { EnhancedMobileChatButton, EnhancedStickyChat } from "./EnhancedStickyChat";
export { StreamingText, TypingText } from "./TypingText";

// Feature components
export { ChatTranscript, ShareMenu } from "./ChatTranscript";
export { ProactivePopup, useProactiveTrigger } from "./ProactivePopup";
export {
  DEFAULT_QUICK_REPLIES,
  DynamicQuickReplies,
  PRODUCT_QUICK_REPLIES,
  QuickReplies,
} from "./QuickReplies";
export { SoundToggleButton, useSoundNotification } from "./SoundNotification";
export { TypingIndicator } from "./TypingIndicator";
