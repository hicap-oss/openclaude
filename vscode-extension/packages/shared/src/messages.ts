/** Typed message definitions for Webview <-> Extension communication */

import type { ChatMessage, ChatState, PermissionRequest, SessionMeta, ToolUseViewModel, Usage } from './types';

/** Messages sent from Extension Host -> Webview */
export type ExtensionToWebviewMessage =
  | { type: 'stream_start' }
  | { type: 'stream_delta'; text: string }
  | { type: 'stream_end'; text: string; usage: Usage | null; final: boolean }
  | { type: 'tool_use'; toolUse: ToolUseViewModel }
  | { type: 'tool_result'; toolUseId: string; content: string; isError: boolean }
  | { type: 'tool_input_ready'; toolUseId: string; input: unknown; name: string }
  | { type: 'tool_progress'; toolUseId: string; content: string }
  | { type: 'permission_request' } & PermissionRequest
  | { type: 'thinking_start' }
  | { type: 'thinking_delta'; tokens: number; elapsed: number }
  | { type: 'thinking_end' }
  | { type: 'status'; content: string }
  | { type: 'rate_limit'; message: string }
  | { type: 'system_info'; model: string | null; sessionId: string | null }
  | { type: 'error'; message: string }
  | { type: 'session_list'; sessions: SessionMeta[] }
  | { type: 'session_cleared' }
  | { type: 'restore_messages'; messages: ChatMessage[] }
  | { type: 'connected'; message: string };

/** Messages sent from Webview -> Extension Host */
export type WebviewToExtensionMessage =
  | { type: 'send_message'; text: string }
  | { type: 'abort' }
  | { type: 'new_session' }
  | { type: 'resume_session'; sessionId: string }
  | { type: 'permission_response'; requestId: string; action: 'allow' | 'deny' | 'allow-session'; toolUseId: string | null }
  | { type: 'copy_code'; text: string }
  | { type: 'open_file'; path: string }
  | { type: 'request_sessions' }
  | { type: 'restore_request' }
  | { type: 'webview_ready' }
  | { type: 'launch' }
  | { type: 'launchRoot' }
  | { type: 'openProfile' }
  | { type: 'repo' }
  | { type: 'setup' }
  | { type: 'commands' }
  | { type: 'refresh' };
