import { createContext, useContext, useReducer, useCallback } from "react";
import { postMessage } from "../lib/vscode";
import type {
  ChatMessage,
  ChatState,
  AgentMode,
  ToolExecution,
  ThinkingBlock,
  PermissionRequest,
} from "../types";

// Actions
type ChatAction =
  | { type: "SET_MESSAGES"; messages: ChatMessage[] }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "APPEND_TOKEN"; token: string }
  | { type: "SET_STREAMING"; isStreaming: boolean }
  | { type: "SET_AGENT_MODE"; mode: AgentMode }
  | { type: "TOOL_START"; tool: ToolExecution }
  | { type: "TOOL_END"; toolId: string; output: string; error?: string }
  | { type: "THINKING_START"; thinking: ThinkingBlock }
  | { type: "THINKING_END"; thinkingId: string }
  | { type: "PERMISSION_REQUEST"; request: PermissionRequest }
  | { type: "PERMISSION_RESOLVED"; requestId: string }
  | { type: "SET_ACTIVE_SESSION"; sessionId: string }
  | { type: "CLEAR" };

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  agentMode: "code",
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.messages };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };

    case "APPEND_TOKEN": {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const lastMsg = messages[lastIdx];
      if (lastMsg && lastMsg.role === "assistant") {
        // Create new object instead of mutating
        messages[lastIdx] = { ...lastMsg, content: lastMsg.content + action.token };
      } else {
        messages.push({
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: action.token,
          timestamp: Date.now(),
        });
      }
      return { ...state, messages };
    }

    case "SET_STREAMING":
      return { ...state, isStreaming: action.isStreaming };

    case "SET_AGENT_MODE":
      return { ...state, agentMode: action.mode };

    case "TOOL_START": {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const lastMsg = messages[lastIdx];
      if (lastMsg && lastMsg.role === "assistant") {
        messages[lastIdx] = {
          ...lastMsg,
          tools: [...(lastMsg.tools || []), action.tool],
        };
      }
      return { ...state, messages };
    }

    case "TOOL_END": {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const lastMsg = messages[lastIdx];
      if (lastMsg?.tools) {
        messages[lastIdx] = {
          ...lastMsg,
          tools: lastMsg.tools.map((t) =>
            t.id === action.toolId
              ? { ...t, output: action.output, error: action.error, status: action.error ? "error" as const : "done" as const }
              : t
          ),
        };
      }
      return { ...state, messages };
    }

    case "THINKING_START": {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const lastMsg = messages[lastIdx];
      if (lastMsg && lastMsg.role === "assistant") {
        messages[lastIdx] = {
          ...lastMsg,
          thinking: [...(lastMsg.thinking || []), action.thinking],
        };
      }
      return { ...state, messages };
    }

    case "THINKING_END": {
      const messages = [...state.messages];
      const lastIdx = messages.length - 1;
      const lastMsg = messages[lastIdx];
      if (lastMsg?.thinking) {
        messages[lastIdx] = {
          ...lastMsg,
          thinking: lastMsg.thinking.map((t) =>
            t.id === action.thinkingId ? { ...t, status: "done" as const } : t
          ),
        };
      }
      return { ...state, messages };
    }

    case "PERMISSION_REQUEST":
      // Permission requests are handled in Chat.tsx via lastMessage
      return state;

    case "PERMISSION_RESOLVED":
      // Permission resolved, nothing to change in state
      return state;

    case "SET_ACTIVE_SESSION":
      return { ...state, activeSessionId: action.sessionId };

    case "CLEAR":
      return initialState;

    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => void;
  abort: () => void;
  clearChat: () => void;
  setAgentMode: (mode: AgentMode) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(
    (content: string) => {
      dispatch({
        type: "ADD_MESSAGE",
        message: {
          id: `msg_${Date.now()}`,
          role: "user",
          content,
          timestamp: Date.now(),
        },
      });
      dispatch({ type: "SET_STREAMING", isStreaming: true });
      postMessage({ type: "sendMessage", content });
    },
    []
  );

  const abort = useCallback(() => {
    dispatch({ type: "SET_STREAMING", isStreaming: false });
    postMessage({ type: "abort" });
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const setAgentMode = useCallback((mode: AgentMode) => {
    dispatch({ type: "SET_AGENT_MODE", mode });
    postMessage({ type: "setAgentMode", mode });
  }, []);

  return (
    <ChatContext.Provider
      value={{ state, dispatch, sendMessage, abort, clearChat, setAgentMode }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
