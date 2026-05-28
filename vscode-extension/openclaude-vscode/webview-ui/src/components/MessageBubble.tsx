import { User, Bot } from "lucide-react";
import type { ChatMessage } from "../types";
import { cn } from "../lib/utils";
import { Markdown } from "./Markdown";
import { ToolCard } from "./ToolCard";
import { ThinkingBlock } from "./ThinkingBlock";

interface MessageBubbleProps {
  message: ChatMessage;
  onOpenFile?: (path: string) => void;
  onCopyCode?: (code: string) => void;
}

export function MessageBubble({
  message,
  onOpenFile,
  onCopyCode,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-oc-accent" : "bg-oc-cyan"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-oc-bg" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 max-w-[85%] space-y-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Thinking Blocks */}
        {message.thinking?.map((thinking) => (
          <ThinkingBlock key={thinking.id} thinking={thinking} />
        ))}

        {/* Tool Cards */}
        {message.tools?.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onOpenFile={onOpenFile}
            onCopyCode={onCopyCode}
          />
        ))}

        {/* Message Content */}
        {message.content && (
          <div
            className={cn(
              "rounded-card p-3",
              isUser
                ? "bg-oc-accent text-white ml-auto"
                : "bg-oc-card border border-oc-border"
            )}
          >
            {isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="text-sm">
                <Markdown content={message.content} onCopyCode={onCopyCode} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
