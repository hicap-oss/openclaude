import type {
  NDJSONMessage,
  ChatMessage,
  ToolExecution,
  ThinkingBlock,
} from "../types";
import {
  isTextDelta,
  isToolUse,
  isToolResult,
  isThinking,
  getToolIcon,
} from "../protocol";

// Transform raw NDJSON messages into view-model ChatMessages
export class MessageParser {
  private messages: ChatMessage[] = [];
  private currentAssistant: ChatMessage | null = null;
  private pendingTools: Map<string, ToolExecution> = new Map();
  private pendingThinking: Map<string, ThinkingBlock> = new Map();

  reset(): void {
    this.messages = [];
    this.currentAssistant = null;
    this.pendingTools.clear();
    this.pendingThinking.clear();
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  addUserMessage(content: string): ChatMessage {
    const msg: ChatMessage = {
      id: this.generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    return msg;
  }

  processMessage(ndjson: NDJSONMessage): {
    message?: ChatMessage;
    token?: string;
    tool?: ToolExecution;
    toolEnd?: { id: string; output: string; error?: string };
    thinking?: ThinkingBlock;
    thinkingEnd?: { id: string };
  } {
    if (isTextDelta(ndjson)) {
      return this.handleTextDelta(ndjson.text);
    }

    if (isToolUse(ndjson)) {
      return this.handleToolUse(ndjson.id, ndjson.name, ndjson.input);
    }

    if (isToolResult(ndjson)) {
      return this.handleToolResult(ndjson.tool_use_id, ndjson.content, ndjson.is_error);
    }

    if (isThinking(ndjson)) {
      return this.handleThinking(ndjson.id, ndjson.thinking);
    }

    return {};
  }

  finalizeAssistantMessage(): ChatMessage | null {
    if (!this.currentAssistant) return null;

    // Finalize any pending tools
    for (const [id, tool] of this.pendingTools) {
      if (!this.currentAssistant.tools) {
        this.currentAssistant.tools = [];
      }
      this.currentAssistant.tools.push(tool);
    }
    this.pendingTools.clear();

    // Finalize any pending thinking
    for (const [id, thinking] of this.pendingThinking) {
      if (!this.currentAssistant.thinking) {
        this.currentAssistant.thinking = [];
      }
      this.currentAssistant.thinking.push({ ...thinking, status: "done" });
    }
    this.pendingThinking.clear();

    this.messages.push(this.currentAssistant);
    const msg = this.currentAssistant;
    this.currentAssistant = null;
    return msg;
  }

  private handleTextDelta(text: string): { token: string } {
    if (!this.currentAssistant) {
      this.currentAssistant = {
        id: this.generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
    }
    this.currentAssistant.content += text;
    return { token: text };
  }

  private handleToolUse(
    id: string,
    name: string,
    input: Record<string, unknown>
  ): { tool: ToolExecution } {
    const tool: ToolExecution = {
      id,
      name,
      icon: getToolIcon(name),
      input: typeof input === "object" ? JSON.stringify(input, null, 2) : String(input),
      status: "running",
      filePath: input?.path as string | undefined,
    };
    this.pendingTools.set(id, tool);
    return { tool };
  }

  private handleToolResult(
    toolId: string,
    output: string,
    isError?: boolean
  ): { toolEnd: { id: string; output: string; error?: string } } {
    const tool = this.pendingTools.get(toolId);
    if (tool) {
      tool.output = output;
      tool.error = isError ? output : undefined;
      tool.status = isError ? "error" : "done";

      if (this.currentAssistant) {
        if (!this.currentAssistant.tools) {
          this.currentAssistant.tools = [];
        }
        this.currentAssistant.tools.push(tool);
      }
      this.pendingTools.delete(toolId);
    }

    return {
      toolEnd: {
        id: toolId,
        output,
        error: isError ? output : undefined,
      },
    };
  }

  private handleThinking(
    id: string,
    content: string
  ): { thinking: ThinkingBlock } {
    const existing = this.pendingThinking.get(id);
    if (existing) {
      existing.content += content;
      return { thinking: existing };
    }

    const thinking: ThinkingBlock = {
      id,
      content,
      status: "thinking",
    };
    this.pendingThinking.set(id, thinking);
    return { thinking };
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
