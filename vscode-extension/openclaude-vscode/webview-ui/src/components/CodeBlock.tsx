import React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  onCopy?: (code: string) => void;
}

export function CodeBlock({ code, language, className, onCopy }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy?.(code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-oc-surface border-b border-oc-border">
        {language && (
          <span className="text-xs text-oc-text-dim font-mono">{language}</span>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-oc-text-muted hover:text-oc-text opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="p-3 overflow-x-auto bg-oc-card">
        <code className="text-sm font-mono text-oc-text">{code}</code>
      </pre>
    </div>
  );
}
