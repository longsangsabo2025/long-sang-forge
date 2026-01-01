/**
 * ChatMarkdown - Simple Markdown renderer for chat messages
 *
 * Supports:
 * - **bold** text
 * - *italic* text
 * - • bullet points
 * - Line breaks
 * - Emoji (native)
 *
 * No external dependencies needed!
 */

import React from "react";

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ content, className = "" }) => {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        elements.push(<br key={`br-${lineIndex}`} />);
      }

      // Parse inline markdown
      const parsedLine = parseInlineMarkdown(line, lineIndex);
      elements.push(...parsedLine);
    });

    return elements;
  };

  const parseInlineMarkdown = (text: string, lineIndex: number): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];

    // Regex patterns
    const patterns = [
      // Bold: **text** or __text__
      {
        regex: /\*\*(.+?)\*\*/g,
        render: (match: string, key: string) => (
          <strong key={key} className="font-semibold">
            {match}
          </strong>
        ),
      },
      {
        regex: /__(.+?)__/g,
        render: (match: string, key: string) => (
          <strong key={key} className="font-semibold">
            {match}
          </strong>
        ),
      },
      // Italic: *text* or _text_ (but not ** or __)
      {
        regex: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
        render: (match: string, key: string) => <em key={key}>{match}</em>,
      },
      // Bullet points: • or - at start
      {
        regex: /^[•-]\s*(.+)$/g,
        render: (match: string, key: string) => (
          <span key={key} className="flex items-start gap-1.5">
            <span className="text-primary mt-0.5">•</span>
            <span>{match}</span>
          </span>
        ),
      },
    ];

    // Simple parser - process bold first
    let processedText = text;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match **bold** text
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    const tempParts: { start: number; end: number; content: string; type: "bold" | "text" }[] = [];

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tempParts.push({
          start: lastIndex,
          end: match.index,
          content: text.slice(lastIndex, match.index),
          type: "text",
        });
      }
      tempParts.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1],
        type: "bold",
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      tempParts.push({
        start: lastIndex,
        end: text.length,
        content: text.slice(lastIndex),
        type: "text",
      });
    }

    // If no bold found, check for bullet points
    if (tempParts.length === 0) {
      // Check if line starts with bullet
      if (/^[•-]\s+/.test(text)) {
        const bulletContent = text.replace(/^[•-]\s+/, "");
        return [
          <span key={`${lineIndex}-bullet`} className="flex items-start gap-2">
            <span className="text-primary/70 mt-0.5 flex-shrink-0">•</span>
            <span>{parseBoldInText(bulletContent, lineIndex)}</span>
          </span>,
        ];
      }
      return [<span key={`${lineIndex}-text`}>{text}</span>];
    }

    // Convert parts to React elements
    return tempParts.map((part, idx) => {
      if (part.type === "bold") {
        return (
          <strong key={`${lineIndex}-${idx}-bold`} className="font-semibold text-foreground">
            {part.content}
          </strong>
        );
      }
      // Check for bullet in text part
      if (/^[•-]\s+/.test(part.content)) {
        const bulletContent = part.content.replace(/^[•-]\s+/, "");
        return (
          <span key={`${lineIndex}-${idx}-bullet`} className="flex items-start gap-2">
            <span className="text-primary/70 mt-0.5 flex-shrink-0">•</span>
            <span>{bulletContent}</span>
          </span>
        );
      }
      return <span key={`${lineIndex}-${idx}-text`}>{part.content}</span>;
    });
  };

  // Helper to parse bold within text
  const parseBoldInText = (text: string, lineIndex: number): React.ReactNode => {
    const boldRegex = /\*\*(.+?)\*\*/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`${lineIndex}-inner-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  return <div className={`chat-markdown ${className}`}>{parseMarkdown(content)}</div>;
};

// Simpler version for streaming text
export const ChatMarkdownSimple: React.FC<ChatMarkdownProps> = ({ content, className = "" }) => {
  // Quick parse for common patterns
  const renderContent = () => {
    // Split by lines
    return content.split("\n").map((line, i) => {
      // Parse bold
      let parsed: React.ReactNode = line.replace(/\*\*(.+?)\*\*/g, (_, text) => `<b>${text}</b>`);

      // Check for bullet
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
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <span
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>'),
            }}
          />
        </React.Fragment>
      );
    });
  };

  return <div className={className}>{renderContent()}</div>;
};
