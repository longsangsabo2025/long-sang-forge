/**
 * Smart Chat Analytics - Track what matters
 *
 * "You can't improve what you don't measure" - Every smart person ever
 *
 * This tracks:
 * 1. Conversation starts
 * 2. Messages sent
 * 3. Conversion actions (CTA clicks)
 * 4. Drop-off points
 * 5. Popular questions
 */

interface ChatEvent {
  type: "conversation_start" | "message_sent" | "cta_clicked" | "conversation_end" | "error";
  timestamp: Date;
  data: Record<string, unknown>;
}

interface ConversationMetrics {
  sessionId: string;
  startTime: Date;
  messageCount: number;
  userMessageCount: number;
  aiMessageCount: number;
  ctaClicks: string[];
  lastActivity: Date;
  converted: boolean;
  source: string;
}

const ANALYTICS_KEY = "longsang_chat_analytics";
const SESSION_KEY = "longsang_chat_session";

class ChatAnalytics {
  private sessionId: string;
  private events: ChatEvent[] = [];
  private metrics: ConversationMetrics;

  constructor() {
    this.sessionId = this.getOrCreateSession();
    this.metrics = this.loadMetrics();
  }

  private getOrCreateSession(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  private loadMetrics(): ConversationMetrics {
    const stored = localStorage.getItem(`${ANALYTICS_KEY}_${this.sessionId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        startTime: new Date(parsed.startTime),
        lastActivity: new Date(parsed.lastActivity),
      };
    }

    return {
      sessionId: this.sessionId,
      startTime: new Date(),
      messageCount: 0,
      userMessageCount: 0,
      aiMessageCount: 0,
      ctaClicks: [],
      lastActivity: new Date(),
      converted: false,
      source: this.detectSource(),
    };
  }

  private detectSource(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get("utm_source") || params.get("ref") || "direct";
  }

  private saveMetrics(): void {
    localStorage.setItem(`${ANALYTICS_KEY}_${this.sessionId}`, JSON.stringify(this.metrics));
  }

  // Track conversation start
  trackStart(source: string = "widget"): void {
    this.events.push({
      type: "conversation_start",
      timestamp: new Date(),
      data: { source, sessionId: this.sessionId },
    });
    this.metrics.source = source;
    this.saveMetrics();

    // Send to backend if available
    this.sendToBackend("conversation_start", { source });
  }

  // Track message
  trackMessage(role: "user" | "assistant", content: string, intent?: string): void {
    this.events.push({
      type: "message_sent",
      timestamp: new Date(),
      data: { role, contentLength: content.length, intent },
    });

    this.metrics.messageCount++;
    if (role === "user") {
      this.metrics.userMessageCount++;
    } else {
      this.metrics.aiMessageCount++;
    }
    this.metrics.lastActivity = new Date();
    this.saveMetrics();

    // Extract keywords for popular questions
    if (role === "user") {
      this.trackPopularKeywords(content);
    }
  }

  // Track CTA click
  trackCTAClick(ctaType: string, ctaLabel: string): void {
    this.events.push({
      type: "cta_clicked",
      timestamp: new Date(),
      data: { ctaType, ctaLabel },
    });

    this.metrics.ctaClicks.push(ctaType);
    this.metrics.converted = true;
    this.saveMetrics();

    this.sendToBackend("cta_clicked", { ctaType, ctaLabel });
  }

  // Track popular keywords/topics
  private trackPopularKeywords(content: string): void {
    const keywords = [
      "website",
      "web",
      "app",
      "ứng dụng",
      "ai",
      "chatbot",
      "tự động",
      "seo",
      "marketing",
      "giá",
      "chi phí",
      "báo giá",
      "dầu ăn",
      "cooking oil",
      "đầu tư",
      "invest",
      "liên hệ",
      "contact",
    ];

    const lowerContent = content.toLowerCase();
    const matchedKeywords = keywords.filter((kw) => lowerContent.includes(kw));

    if (matchedKeywords.length > 0) {
      const stored = JSON.parse(localStorage.getItem("longsang_popular_keywords") || "{}");
      matchedKeywords.forEach((kw) => {
        stored[kw] = (stored[kw] || 0) + 1;
      });
      localStorage.setItem("longsang_popular_keywords", JSON.stringify(stored));
    }
  }

  // Get session metrics
  getMetrics(): ConversationMetrics {
    return this.metrics;
  }

  // Get all historical analytics
  static getHistoricalAnalytics(): {
    sessions: number;
    totalMessages: number;
    conversions: number;
    popularKeywords: Record<string, number>;
  } {
    const sessions: ConversationMetrics[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(ANALYTICS_KEY)) {
        try {
          sessions.push(JSON.parse(localStorage.getItem(key) || "{}"));
        } catch {
          // Skip invalid entries
        }
      }
    }

    return {
      sessions: sessions.length,
      totalMessages: sessions.reduce((sum, s) => sum + (s.messageCount || 0), 0),
      conversions: sessions.filter((s) => s.converted).length,
      popularKeywords: JSON.parse(localStorage.getItem("longsang_popular_keywords") || "{}"),
    };
  }

  // Send to backend for persistent storage
  private async sendToBackend(eventType: string, data: Record<string, unknown>): Promise<void> {
    try {
      // Fire and forget - don't block UI
      fetch("/api/analytics/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          eventType,
          data,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    } catch {
      // Ignore errors
    }
  }
}

// Singleton instance
let analyticsInstance: ChatAnalytics | null = null;

export const getChatAnalytics = (): ChatAnalytics => {
  if (!analyticsInstance) {
    analyticsInstance = new ChatAnalytics();
  }
  return analyticsInstance;
};

export type { ChatEvent, ConversationMetrics };
