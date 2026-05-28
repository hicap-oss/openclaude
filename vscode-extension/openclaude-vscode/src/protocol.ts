import type {
  NDJSONMessage,
  NDJSONTextDelta,
  NDJSONToolUse,
  NDJSONToolResult,
  NDJSONThinking,
  NDJSONPermissionRequest,
  NDJSONSessionList,
  NDJSONError,
} from "./types";

// Parse a single NDJSON line into a typed message
export function parseNDJSONLine(line: string): NDJSONMessage | null {
  try {
    const msg = JSON.parse(line);
    if (!msg || typeof msg.type !== "string") {
      return null;
    }
    return msg as NDJSONMessage;
  } catch {
    return null;
  }
}

// Type guards for NDJSON messages
export function isTextDelta(msg: NDJSONMessage): msg is NDJSONTextDelta {
  return msg.type === "text_delta" && typeof (msg as NDJSONTextDelta).text === "string";
}

export function isToolUse(msg: NDJSONMessage): msg is NDJSONToolUse {
  return msg.type === "tool_use" && typeof (msg as NDJSONToolUse).id === "string";
}

export function isToolResult(msg: NDJSONMessage): msg is NDJSONToolResult {
  return msg.type === "tool_result" && typeof (msg as NDJSONToolResult).tool_use_id === "string";
}

export function isThinking(msg: NDJSONMessage): msg is NDJSONThinking {
  return msg.type === "thinking" && typeof (msg as NDJSONThinking).id === "string";
}

export function isPermissionRequest(msg: NDJSONMessage): msg is NDJSONPermissionRequest {
  return msg.type === "permission_request" && typeof (msg as NDJSONPermissionRequest).id === "string";
}

export function isSessionList(msg: NDJSONMessage): msg is NDJSONSessionList {
  return msg.type === "sessions" && Array.isArray((msg as NDJSONSessionList).sessions);
}

export function isError(msg: NDJSONMessage): msg is NDJSONError {
  return msg.type === "error" && typeof (msg as NDJSONError).message === "string";
}

// Serialize a message to NDJSON line
export function toNDJSONLine(msg: Record<string, unknown>): string {
  return JSON.stringify(msg);
}

// Tool name to icon mapping
export function getToolIcon(toolName: string): string {
  const iconMap: Record<string, string> = {
    read: "file-text",
    write: "file-plus",
    edit: "file-edit",
    bash: "terminal",
    search: "search",
    glob: "folder-search",
    grep: "text-search",
    web_fetch: "globe",
    web_search: "search-code",
    list_files: "folder-open",
    ask_user: "message-circle",
    think: "brain",
    task: "list-checks",
    agent: "bot",
  };
  return iconMap[toolName] ?? "wrench";
}
