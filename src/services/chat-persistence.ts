/**
 * Chat Persistence Service
 * Syncs chat history with Supabase database (like Open WebUI pattern)
 *
 * Flow:
 * 1. Save to localStorage first (instant feedback)
 * 2. Sync to Supabase in background (for logged-in users)
 * 3. Load from Supabase on login, fallback to localStorage
 */

import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  assistant_type: string;
  title: string;
  messages: { role: string; content: string }[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const ASSISTANT_TYPE = "sales-consultant";
const DEBUG = true;

const log = (action: string, ...args: unknown[]) => {
  if (DEBUG) console.log(`[ChatPersistence] ${action}`, ...args);
};

/**
 * Get or create conversation for current user
 */
export async function getOrCreateConversation(userId: string): Promise<string | null> {
  try {
    // Check if user has existing sales-consultant conversation
    const { data: existing, error: fetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("assistant_type", ASSISTANT_TYPE)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (existing && !fetchError) {
      log("Found existing conversation:", existing.id);
      return existing.id;
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        assistant_type: ASSISTANT_TYPE,
        title: "Long Sang AI",
        messages: [],
        metadata: { source: "global-chat" },
      })
      .select("id")
      .single();

    if (createError) {
      console.error("[ChatPersistence] Create error:", createError);
      return null;
    }

    log("Created new conversation:", newConv?.id);
    return newConv?.id || null;
  } catch (error) {
    console.error("[ChatPersistence] getOrCreateConversation error:", error);
    return null;
  }
}

/**
 * Load messages from database
 */
export async function loadMessagesFromDB(userId: string): Promise<ChatMessage[] | null> {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("messages, updated_at")
      .eq("user_id", userId)
      .eq("assistant_type", ASSISTANT_TYPE)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      log("No conversation found in DB");
      return null;
    }

    const messages = data.messages as { role: string; content: string }[];
    if (!messages || messages.length === 0) {
      log("Empty messages in DB");
      return null;
    }

    // Convert to ChatMessage format
    const chatMessages: ChatMessage[] = messages.map((msg, index) => ({
      id: `db-${index}`,
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: new Date(data.updated_at),
    }));

    log("Loaded", chatMessages.length, "messages from DB");
    return chatMessages;
  } catch (error) {
    console.error("[ChatPersistence] loadMessagesFromDB error:", error);
    return null;
  }
}

/**
 * Save messages to database (debounced in hook)
 */
export async function saveMessagesToDB(
  userId: string,
  messages: ChatMessage[],
  title?: string
): Promise<boolean> {
  try {
    // Convert to DB format (strip unnecessary fields)
    const dbMessages = messages
      .filter((m) => m.id !== "welcome") // Don't save welcome message
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    if (dbMessages.length === 0) {
      log("No messages to save (only welcome)");
      return true;
    }

    // Generate title from first user message if not provided
    const chatTitle =
      title || dbMessages.find((m) => m.role === "user")?.content.slice(0, 50) || "Long Sang AI";

    // Upsert: update if exists, create if not
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("assistant_type", ASSISTANT_TYPE)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from("conversations")
        .update({
          messages: dbMessages,
          title: chatTitle,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("[ChatPersistence] Update error:", error);
        return false;
      }
      log("Updated conversation:", existing.id, "with", dbMessages.length, "messages");
    } else {
      // Create new
      const { error } = await supabase.from("conversations").insert({
        user_id: userId,
        assistant_type: ASSISTANT_TYPE,
        title: chatTitle,
        messages: dbMessages,
        metadata: { source: "global-chat" },
      });

      if (error) {
        console.error("[ChatPersistence] Insert error:", error);
        return false;
      }
      log("Created conversation with", dbMessages.length, "messages");
    }

    return true;
  } catch (error) {
    console.error("[ChatPersistence] saveMessagesToDB error:", error);
    return false;
  }
}

/**
 * Clear conversation from database
 */
export async function clearConversationFromDB(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", userId)
      .eq("assistant_type", ASSISTANT_TYPE);

    if (error) {
      console.error("[ChatPersistence] Delete error:", error);
      return false;
    }

    log("Cleared conversation from DB");
    return true;
  } catch (error) {
    console.error("[ChatPersistence] clearConversationFromDB error:", error);
    return false;
  }
}
