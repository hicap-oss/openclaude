// Agent modes
export type AgentMode = "code" | "architect" | "debug" | "ask";

// Permission modes
export type PermissionMode = "default" | "acceptEdits" | "bypassPermissions" | "plan";

// Extension settings
export interface ExtensionSettings {
  launchCommand: string;
  terminalName: string;
  useOpenAIShim: boolean;
  permissionMode: PermissionMode;
  agentMode: AgentMode;
}

// Message types for webview communication
export type WebviewMessage =
  | { type: "ready" }
  | { type: "sendMessage"; content: string }
  | { type: "abort" }
  | { type: "resumeSession"; sessionId: string }
  | { type: "setAgentMode"; mode: AgentMode }
  | { type: "allowPermission"; requestId: string }
  | { type: "denyPermission"; requestId: string }
  | { type: "allowPermissionForSession"; requestId: string }
  | { type: "openFile"; path: string }
  | { type: "openDiff"; path: string; content: string }
  | { type: "copyCode"; code: string }
  | { type: "openSettings" }
  | { type: "refreshControlCenter" };

export type ExtensionMessage =
  | { type: "state"; state: ControlCenterState }
  | { type: "chatState"; state: ChatState }
  | { type: "streamToken"; token: string }
  | { type: "toolStart"; tool: ToolExecution }
  | { type: "toolEnd"; toolId: string; output: string; error?: string }
  | { type: "thinkingStart"; thinking: ThinkingBlock }
  | { type: "thinkingEnd"; thinkingId: string }
  | { type: "permissionRequest"; request: PermissionRequest }
  | { type: "permissionResolved"; requestId: string }
  | { type: "messageComplete" }
  | { type: "error"; error: string }
  | { type: "sessions"; sessions: SessionInfo[] }
  | { type: "agentModeChanged"; mode: AgentMode };

// Control Center state
export interface ControlCenterState {
  cliFound: boolean;
  cliPath?: string;
  provider?: string;
  workspaceFolder?: string;
  profileExists: boolean;
  profileValid: boolean;
}

// Chat state
export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  agentMode: AgentMode;
  activeSessionId?: string;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  tools?: ToolExecution[];
  thinking?: ThinkingBlock[];
}

// Tool execution
export interface ToolExecution {
  id: string;
  name: string;
  icon: string;
  input?: string;
  output?: string;
  error?: string;
  status: "running" | "done" | "error";
  filePath?: string;
}

// Thinking block
export interface ThinkingBlock {
  id: string;
  content: string;
  tokenCount?: number;
  elapsedMs?: number;
  status: "thinking" | "done";
}

// Permission request
export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  input?: string;
}

// Session info
export interface SessionInfo {
  id: string;
  name: string;
  timestamp: number;
  messageCount: number;
  preview: string;
}

// Agent mode config
export interface AgentModeConfig {
  mode: AgentMode;
  label: string;
  description: string;
  icon: string;
  systemPrompt?: string;
  allowedTools?: string[];
}

// NDJSON protocol message types (from CLI)
export interface NDJSONMessage {
  type: string;
  [key: string]: unknown;
}

export interface NDJSONTextDelta extends NDJSONMessage {
  type: "text_delta";
  text: string;
}

export interface NDJSONToolUse extends NDJSONMessage {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface NDJSONToolResult extends NDJSONMessage {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

export interface NDJSONThinking extends NDJSONMessage {
  type: "thinking";
  id: string;
  thinking: string;
}

export interface NDJSONPermissionRequest extends NDJSONMessage {
  type: "permission_request";
  id: string;
  tool_name: string;
  description: string;
  input?: Record<string, unknown>;
}

export interface NDJSONSessionList extends NDJSONMessage {
  type: "sessions";
  sessions: Array<{
    id: string;
    name: string;
    timestamp: number;
    message_count: number;
    preview: string;
  }>;
}

export interface NDJSONError extends NDJSONMessage {
  type: "error";
  message: string;
}
