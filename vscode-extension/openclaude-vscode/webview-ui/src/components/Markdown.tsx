import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface MarkdownProps {
  content: string;
  onCopyCode?: (code: string) => void;
}

export function Markdown({ content, onCopyCode }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const code = String(children).replace(/\n$/, "");

          // If it has a language class, it's a code block (rendered inside pre)
          if (match) {
            return (
              <CodeBlock
                code={code}
                language={match[1]}
                onCopy={onCopyCode}
              />
            );
          }

          // Check if this is inside a pre element (code block without language)
          // If className is set but no language match, it's likely a code block
          if (className) {
            return <CodeBlock code={code} onCopy={onCopyCode} />;
          }

          // Inline code
          return (
            <code
              className="bg-oc-card px-1.5 py-0.5 rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-oc-info hover:text-oc-cyan underline"
            >
              {children}
            </a>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-1">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-2 border-oc-accent pl-3 italic text-oc-text-muted mb-3">
              {children}
            </blockquote>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="px-3 py-2 text-left border-b border-oc-border font-medium">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-3 py-2 border-b border-oc-border">{children}</td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
