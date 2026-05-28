import React from "react";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import type { ThinkingBlock as ThinkingBlockType } from "../types";
import { cn } from "../lib/utils";

interface ThinkingBlockProps {
  thinking: ThinkingBlockType;
}

export function ThinkingBlock({ thinking }: ThinkingBlockProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border border-oc-purple/30 bg-oc-purple/5 transition-all",
        thinking.status === "thinking" && "border-oc-purple/50 animate-pulse"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left"
      >
        <Brain className="w-4 h-4 text-oc-purple" />
        <span className="flex-1 text-sm text-oc-text-muted">
          {thinking.status === "thinking" ? "Thinking..." : "Extended Thinking"}
        </span>
        {thinking.tokenCount && (
          <span className="text-xs text-oc-text-dim">
            {thinking.tokenCount} tokens
          </span>
        )}
        {thinking.elapsedMs && (
          <span className="text-xs text-oc-text-dim">
            {(thinking.elapsedMs / 1000).toFixed(1)}s
          </span>
        )}
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-oc-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-oc-text-muted" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          <div className="text-sm text-oc-text-muted whitespace-pre-wrap bg-oc-surface p-3 rounded font-mono text-xs">
            {thinking.content}
          </div>
        </div>
      )}
    </div>
  );
}
