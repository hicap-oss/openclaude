/** Domain types shared between extension host and webview */

export interface SessionMeta {
  id: string;
  title: string;
  preview: string;
  timeLabel: string;
  timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  toolUses?: ToolUseViewModel[];
}

export interface ToolUseViewModel {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  inputPreview: string;
  input?: unknown;
  status: 'running' | 'completed' | 'error';
}

export interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface ProviderState {
  source: 'profile' | 'env' | 'shim' | 'unknown';
  apiKey: string;
  provider: string;
  model: string;
}

export interface ControlCenterState {
  installed: boolean;
  executable: string;
  launchCommand: string;
  terminalName: string;
  shimEnabled: boolean;
  workspaceFolder: string | null;
  workspaceSourceLabel: string;
  launchCwd: string | null;
  launchCwdLabel: string;
  launchCwdSourceLabel: string;
  workspaceRootCwd: string | null;
  workspaceRootCwdLabel: string;
  launchActionsShareTarget: boolean;
  launchActionsShareTargetReason: string | null;
  canLaunchInWorkspaceRoot: boolean;
  profileStatusLabel: string;
  profileStatusHint: string;
  workspaceProfilePath: string | null;
  providerState: ProviderState;
  providerSourceLabel: string;
}

export interface PermissionRequest {
  requestId: string;
  toolName: string;
  displayName: string;
  description: string;
  inputPreview: string;
  toolUseId: string | null;
}

export type ChatState = 'idle' | 'connected' | 'streaming';
