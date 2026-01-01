/**
 * TypingText - Real-time typing animation like ChatGPT
 *
 * Elon says: "Show progress, not wait times"
 */

import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  className?: string;
}

export const TypingText = ({
  text,
  speed = 15, // Fast like GPT
  onComplete,
  className = "",
}: TypingTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setIsComplete(false);

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        // Add characters in chunks for speed
        const chunkSize = Math.min(3, text.length - index);
        setDisplayedText(text.substring(0, index + chunkSize));
        index += chunkSize;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">▌</span>}
    </span>
  );
};

/**
 * StreamingText - For SSE streaming responses with Markdown support
 */
interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
  className?: string;
}

export const StreamingText = ({ content, isStreaming, className = "" }: StreamingTextProps) => {
  // Simple inline markdown parsing
  const renderWithMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const isBullet = /^[•-]\s/.test(line);

      if (isBullet) {
        const bulletText = line.replace(/^[•-]\s*/, "");
        return (
          <div key={i} className="flex items-start gap-2 my-0.5">
            <span className="text-primary/70 flex-shrink-0">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: bulletText.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="font-semibold">$1</strong>'
                ),
              }}
            />
          </div>
        );
      }

      return (
        <span key={i}>
          {i > 0 && <br />}
          <span
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>'),
            }}
          />
        </span>
      );
    });
  };

  return (
    <div className={className}>
      {renderWithMarkdown(content)}
      {isStreaming && <span className="animate-pulse ml-0.5">▌</span>}
    </div>
  );
};
