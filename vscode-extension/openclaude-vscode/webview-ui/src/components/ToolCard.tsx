import React from "react";
import {
  FileText,
  FilePlus,
  FileEdit,
  Terminal,
  Search,
  FolderSearch,
  Text,
  Globe,
  MessageCircle,
  Brain,
  ListChecks,
  Bot,
  Wrench,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
} from "lucide-react";
import type { ToolExecution } from "../types";
import { cn } from "../lib/utils";
import { Badge } from "./ui/Badge";

interface ToolCardProps {
  tool: ToolExecution;
  onOpenFile?: (path: string) => void;
  onCopyCode?: (code: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  "file-text": <FileText className="w-4 h-4" />,
  "file-plus": <FilePlus className="w-4 h-4" />,
  "file-edit": <FileEdit className="w-4 h-4" />,
  terminal: <Terminal className="w-4 h-4" />,
  search: <Search className="w-4 h-4" />,
  "folder-search": <FolderSearch className="w-4 h-4" />,
  "text-search": <Text className="w-4 h-4" />,
  globe: <Globe className="w-4 h-4" />,
  "message-circle": <MessageCircle className="w-4 h-4" />,
  brain: <Brain className="w-4 h-4" />,
  "list-checks": <ListChecks className="w-4 h-4" />,
  bot: <Bot className="w-4 h-4" />,
  wrench: <Wrench className="w-4 h-4" />,
};

export function ToolCard({ tool, onOpenFile, onCopyCode }: ToolCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const icon = iconMap[tool.icon] || <Wrench className="w-4 h-4" />;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        tool.status === "running" && "border-oc-accent/50 bg-oc-accent/5",
        tool.status === "done" && "border-oc-border bg-oc-card",
        tool.status === "error" && "border-oc-error/50 bg-oc-error/5"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left"
      >
        <span className="text-oc-accent">{icon}</span>
        <span className="flex-1 text-sm font-medium text-oc-text">
          {tool.name}
        </span>
        {tool.filePath && (
          <span className="text-xs text-oc-text-muted truncate max-w-[120px]">
            {tool.filePath.split("/").pop()}
          </span>
        )}
        <Badge
          variant={
            tool.status === "running"
              ? "warning"
              : tool.status === "error"
              ? "error"
              : "success"
          }
        >
          {tool.status}
        </Badge>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-oc-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-oc-text-muted" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Input */}
          {tool.input && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-oc-text-muted">Input</span>
                {onCopyCode && (
                  <button
                    onClick={() => onCopyCode(tool.input!)}
                    className="text-oc-text-muted hover:text-oc-text"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
              <pre className="text-xs bg-oc-surface p-2 rounded overflow-x-auto font-mono">
                {tool.input}
              </pre>
            </div>
          )}

          {/* Output */}
          {tool.output && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-oc-text-muted">Output</span>
                {onCopyCode && (
                  <button
                    onClick={() => onCopyCode(tool.output!)}
                    className="text-oc-text-muted hover:text-oc-text"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
              <pre className="text-xs bg-oc-surface p-2 rounded overflow-x-auto font-mono max-h-[200px]">
                {tool.output}
              </pre>
            </div>
          )}

          {/* Error */}
          {tool.error && (
            <div className="text-xs text-oc-error bg-oc-error/10 p-2 rounded">
              {tool.error}
            </div>
          )}

          {/* File Actions */}
          {tool.filePath && onOpenFile && (
            <button
              onClick={() => onOpenFile(tool.filePath!)}
              className="flex items-center gap-1 text-xs text-oc-info hover:text-oc-cyan"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Editor
            </button>
          )}
        </div>
      )}
    </div>
  );
}
