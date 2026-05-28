// Types for the webview - mirrors the extension host types

export type AgentMode = "code" | "architect" | "debug" | "ask";
export type PermissionMode = "default" | "acceptEdits" | "bypassPermissions" | "plan";

export interface ControlCenterState {
  cliFound: boolean;
  cliPath?: string;
  provider?: string;
  workspaceFolder?: string;
  profileExists: boolean;
  profileValid: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  agentMode: AgentMode;
  activeSessionId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  tools?: ToolExecution[];
  thinking?: ThinkingBlock[];
}

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

export interface ThinkingBlock {
  id: string;
  content: string;
  tokenCount?: number;
  elapsedMs?: number;
  status: "thinking" | "done";
}

export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  input?: string;
}

export interface SessionInfo {
  id: string;
  name: string;
  timestamp: number;
  messageCount: number;
  preview: string;
}

// Extension -> Webview messages
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

// Webview -> Extension messages
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
