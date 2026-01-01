/**
 * useStreamingChat - Elon-style: Real-time streaming responses
 *
 * Why? Because waiting for full response is STUPID.
 * Users should see the AI "thinking" in real-time.
 */

import { useCallback, useRef, useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface UseStreamingChatOptions {
  endpoint: string;
  onError?: (error: Error) => void;
  onComplete?: (response: string) => void;
}

export const useStreamingChat = (options: UseStreamingChatOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      messages: ChatMessage[],
      userMessage: string,
      additionalData?: Record<string, unknown>
    ): Promise<string> => {
      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setStreamingContent("");

      let fullContent = "";

      try {
        const response = await fetch(options.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            userMessage,
            stream: true,
            ...additionalData,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if streaming is supported
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("text/event-stream")) {
          // SSE Streaming
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
                    // Not JSON, just append
                    fullContent += data;
                    setStreamingContent(fullContent);
                  }
                }
              }
            }
          }
        } else {
          // Fallback to regular JSON response
          const data = await response.json();
          fullContent = data.response || data.content || "";
          setStreamingContent(fullContent);
        }

        options.onComplete?.(fullContent);
        return fullContent;
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return fullContent;
        }
        options.onError?.(error as Error);
        throw error;
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [options]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  return {
    sendMessage,
    cancelStream,
    isStreaming,
    streamingContent,
  };
};
