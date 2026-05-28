/**
 * NDJSON wire protocol types for OpenClaude CLI communication.
 * The CLI runs in --output-format=stream-json mode.
 */

/** Stream event types from the Anthropic streaming API */
export interface StreamEvent {
  type:
    | 'message_start'
    | 'content_block_start'
    | 'content_block_delta'
    | 'content_block_stop'
    | 'message_delta'
    | 'message_stop';
  content_block?: {
    type: 'text' | 'tool_use' | 'thinking';
    id?: string;
    name?: string;
    input?: unknown;
    text?: string;
  };
  delta?: {
    type: 'text_delta' | 'thinking_delta' | 'input_json_delta';
    text?: string;
    thinking?: string;
    partial_json?: string;
  };
  message?: {
    role?: string;
    content?: ContentBlock[];
    usage?: Usage;
  };
  usage?: Usage;
}

export interface ContentBlock {
  type: 'text' | 'tool_use' | 'tool_result' | 'thinking';
  text?: string;
  id?: string;
  tool_use_id?: string;
  name?: string;
  input?: unknown;
  content?: string | ContentBlock[];
  is_error?: boolean;
}

export interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export interface AssistantMessage {
  type: 'assistant';
  message?: {
    role: string;
    content: ContentBlock[];
    usage?: Usage;
  };
  usage?: Usage;
}

export interface SystemMessage {
  type: 'system';
  model?: string;
  session_id?: string;
  sessionId?: string;
}

export interface ResultMessage {
  type: 'result';
  subtype: string;
  usage?: Usage;
  num_turns?: number;
  stop_reason?: string;
}

export interface ControlRequest {
  type: 'control_request';
  request_id: string;
  request: {
    tool_name?: string;
    display_name?: string;
    title?: string;
    description?: string;
    input?: unknown;
    tool_use_id?: string;
  };
}

/** Message type constants */
export const MESSAGE_TYPES = {
  ASSISTANT: 'assistant',
  USER: 'user',
  RESULT: 'result',
  SYSTEM: 'system',
  STREAM_EVENT: 'stream_event',
  CONTROL_REQUEST: 'control_request',
  CONTROL_RESPONSE: 'control_response',
  CONTROL_CANCEL_REQUEST: 'control_cancel_request',
  STATUS: 'status',
  TOOL_PROGRESS: 'tool_progress',
  RATE_LIMIT: 'rate_limit',
} as const;

/** Type guards */
export function isStreamEvent(msg: unknown): msg is { type: 'stream_event'; event: StreamEvent } {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.STREAM_EVENT;
}

export function isAssistantMessage(msg: unknown): msg is AssistantMessage {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.ASSISTANT;
}

export function isSystemMessage(msg: unknown): msg is SystemMessage {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.SYSTEM;
}

export function isResultMessage(msg: unknown): msg is ResultMessage {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.RESULT;
}

export function isControlRequest(msg: unknown): msg is ControlRequest {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.CONTROL_REQUEST;
}

export function isPartialMessage(msg: unknown): boolean {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === 'user';
}

export function isStatusMessage(msg: unknown): boolean {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.STATUS;
}

export function isToolProgressMessage(msg: unknown): boolean {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.TOOL_PROGRESS;
}

export function isRateLimitEvent(msg: unknown): boolean {
  return typeof msg === 'object' && msg !== null && (msg as { type: string }).type === MESSAGE_TYPES.RATE_LIMIT;
}

/** Extract text content from an assistant message's content blocks */
export function getTextContent(msg: { content?: ContentBlock[] } | ContentBlock[]): string {
  const blocks = Array.isArray(msg) ? msg : msg.content || [];
  return blocks
    .filter((b) => b.type === 'text')
    .map((b) => b.text || '')
    .join('');
}

/** Extract tool_use blocks from an assistant message's content */
export function getToolUseBlocks(msg: { content?: ContentBlock[] } | ContentBlock[]): ContentBlock[] {
  const blocks = Array.isArray(msg) ? msg : msg.content || [];
  return blocks.filter((b) => b.type === 'tool_use');
}
