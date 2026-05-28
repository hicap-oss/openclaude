import { useRef, useEffect, useState } from "react";
import { Send, Square, Trash2, PanelLeft } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useVSCode } from "../context/VSCodeContext";
import { MessageBubble } from "./MessageBubble";
import { AgentModeSelector } from "./AgentModeSelector";
import { SessionList } from "./SessionList";
import { PermissionCard } from "./PermissionCard";
import { Button } from "./ui/Button";
import { ScrollArea } from "./ui/ScrollArea";
import type { PermissionRequest } from "../types";

export function Chat() {
  const { state, sendMessage, abort, clearChat, setAgentMode, dispatch } = useChat();
  const { postMessage, lastMessage } = useVSCode();
  const [input, setInput] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<PermissionRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle messages from extension host
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "chatState":
        // Full state sync from extension
        dispatch({ type: "SET_MESSAGES", messages: lastMessage.state.messages });
        dispatch({ type: "SET_STREAMING", isStreaming: lastMessage.state.isStreaming });
        dispatch({ type: "SET_AGENT_MODE", mode: lastMessage.state.agentMode });
        break;

      case "streamToken":
        dispatch({ type: "APPEND_TOKEN", token: lastMessage.token });
        break;

      case "toolStart":
        dispatch({ type: "TOOL_START", tool: lastMessage.tool });
        break;

      case "toolEnd":
        dispatch({
          type: "TOOL_END",
          toolId: lastMessage.toolId,
          output: lastMessage.output,
          error: lastMessage.error,
        });
        break;

      case "thinkingStart":
        dispatch({ type: "THINKING_START", thinking: lastMessage.thinking });
        break;

      case "thinkingEnd":
        dispatch({ type: "THINKING_END", thinkingId: lastMessage.thinkingId });
        break;

      case "messageComplete":
        dispatch({ type: "SET_STREAMING", isStreaming: false });
        break;

      case "permissionRequest":
        setPendingPermission(lastMessage.request);
        break;

      case "permissionResolved":
        setPendingPermission(null);
        break;

      case "error":
        setErrorMessage(lastMessage.error);
        setTimeout(() => setErrorMessage(null), 5000);
        break;

      case "sessions":
        // Handle session list
        break;

      case "agentModeChanged":
        dispatch({ type: "SET_AGENT_MODE", mode: lastMessage.mode });
        break;
    }
  }, [lastMessage]);

  // Auto-scroll to bottom (debounced for streaming)
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [state.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!input.trim() || state.isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFile = (path: string) => {
    postMessage({ type: "openFile", path });
  };

  const handleCopyCode = (code: string) => {
    postMessage({ type: "copyCode", code });
  };

  const handleAllowPermission = (id: string) => {
    postMessage({ type: "allowPermission", requestId: id });
    setPendingPermission(null);
  };

  const handleDenyPermission = (id: string) => {
    postMessage({ type: "denyPermission", requestId: id });
    setPendingPermission(null);
  };

  const handleAllowPermissionForSession = (id: string) => {
    postMessage({ type: "allowPermissionForSession", requestId: id });
    setPendingPermission(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-oc-border bg-oc-sidebar">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSessions(!showSessions)}
            aria-label="Toggle sessions panel"
            title="Sessions"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
          <AgentModeSelector
            currentMode={state.agentMode}
            onModeChange={setAgentMode}
          />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            aria-label="Clear chat"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="px-3 py-2 bg-oc-error/10 border-b border-oc-error/30 text-oc-error text-sm">
          {errorMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sessions Sidebar */}
        {showSessions && (
          <div className="w-64 border-r border-oc-border bg-oc-sidebar">
            <SessionList
              sessions={[]}
              onResume={(id) => {
                postMessage({ type: "resumeSession", sessionId: id });
                setShowSessions(false);
              }}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            {state.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-oc-text-muted">
                <div className="text-6xl mb-4">{"{}"}</div>
                <h2 className="text-lg font-medium mb-1">OpenClaude</h2>
                <p className="text-sm">Start a conversation to begin</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {state.messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onOpenFile={handleOpenFile}
                    onCopyCode={handleCopyCode}
                  />
                ))}

                {/* Permission Card */}
                {pendingPermission && (
                  <PermissionCard
                    request={pendingPermission}
                    onAllow={handleAllowPermission}
                    onDeny={handleDenyPermission}
                    onAllowForSession={handleAllowPermissionForSession}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 border-t border-oc-border bg-oc-sidebar">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <label htmlFor="chat-input" className="sr-only">
                Message
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 bg-oc-surface border border-oc-border rounded-lg text-sm text-oc-text placeholder:text-oc-text-dim resize-none focus:outline-none focus:ring-2 focus:ring-oc-accent"
                rows={1}
              />
              {state.isStreaming ? (
                <Button
                  variant="danger"
                  size="icon"
                  onClick={abort}
                  aria-label="Stop generation"
                  title="Stop Generation"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
