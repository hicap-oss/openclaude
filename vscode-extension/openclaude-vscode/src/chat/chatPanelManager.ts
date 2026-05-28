import * as vscode from "vscode";
import { ProcessManager } from "./processManager";
import { MessageParser } from "./messageParser";
import { SessionManager } from "./sessionManager";
import type {
  WebviewMessage,
  ExtensionMessage,
  ChatState,
  AgentMode,
  ExtensionSettings,
} from "../types";
import { getSettings, getLaunchDirectory } from "../state";

export class ChatPanelManager {
  private panel: vscode.WebviewPanel | undefined;
  private processManager: ProcessManager;
  private messageParser: MessageParser;
  private sessionManager: SessionManager;
  private disposables: vscode.Disposable[] = [];
  private agentMode: AgentMode;

  constructor(private extensionUri: vscode.Uri) {
    this.processManager = new ProcessManager();
    this.messageParser = new MessageParser();
    this.sessionManager = new SessionManager();
    this.agentMode = getSettings().agentMode;

    this.setupProcessManagerEvents();
  }

  private setupProcessManagerEvents(): void {
    this.processManager.on("message", (msg) => {
      this.handleNDJSONMessage(msg);
    });

    this.processManager.on("error", (err) => {
      this.sendToWebview({ type: "error", error: err.message });
    });

    this.processManager.on("exit", (code) => {
      // Finalize the message regardless of exit code
      this.finalizeMessage();

      if (code !== 0 && code !== null) {
        this.sendToWebview({
          type: "error",
          error: `Process exited with code ${code}`,
        });
      }
    });
  }

  async openPanel(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Active);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "openclaudeChat",
      "OpenClaude Chat",
      { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist"),
        ],
      }
    );

    this.panel.webview.html = this.getWebviewContent();
    this.panel.onDidDispose(() => this.disposePanel(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this.handleWebviewMessage(msg),
      null,
      this.disposables
    );
  }

  private async handleWebviewMessage(msg: WebviewMessage): Promise<void> {
    const settings = getSettings();

    switch (msg.type) {
      case "ready":
        this.sendToWebview({
          type: "chatState",
          state: this.buildChatState(),
        });
        break;

      case "sendMessage":
        await this.sendMessage(msg.content, settings);
        break;

      case "abort":
        this.processManager.abort();
        break;

      case "resumeSession": {
        const messages = await this.sessionManager.loadSession(msg.sessionId);
        // TODO: Send resume command to CLI
        break;
      }

      case "setAgentMode":
        this.agentMode = msg.mode;
        this.sendToWebview({ type: "agentModeChanged", mode: msg.mode });
        break;

      case "allowPermission":
        this.processManager.resolvePermission(msg.requestId, true);
        break;

      case "denyPermission":
        this.processManager.resolvePermission(msg.requestId, false);
        break;

      case "allowPermissionForSession":
        this.processManager.resolvePermission(msg.requestId, true, true);
        break;

      case "openFile":
        vscode.commands.executeCommand("vscode.open", vscode.Uri.file(msg.path));
        break;

      case "openDiff":
        // Diff handled by DiffController
        break;

      case "copyCode":
        vscode.env.clipboard.writeText(msg.code);
        vscode.window.showInformationMessage("Code copied to clipboard");
        break;

      case "openSettings":
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "@ext:devnull-bootloader.openclaude-vscode"
        );
        break;
    }
  }

  private async sendMessage(
    content: string,
    settings: ExtensionSettings
  ): Promise<void> {
    if (!this.processManager.isRunning) {
      const cwd = getLaunchDirectory();
      const args = ["--print"];

      // Add agent mode flag
      if (this.agentMode !== "code") {
        args.push("--mode", this.agentMode);
      }

      // Add permission mode flag
      if (settings.permissionMode !== "default") {
        args.push("--permission-mode", settings.permissionMode);
      }

      this.processManager.start(settings.launchCommand, args, cwd);
    }

    this.messageParser.addUserMessage(content);
    this.processManager.sendMessage(content);

    this.sendToWebview({
      type: "chatState",
      state: this.buildChatState(),
    });
  }

  private handleNDJSONMessage(msg: Record<string, unknown>): void {
    const result = this.messageParser.processMessage(msg as any);

    if (result.token) {
      this.sendToWebview({ type: "streamToken", token: result.token });
    }

    if (result.tool) {
      this.sendToWebview({ type: "toolStart", tool: result.tool });
    }

    if (result.toolEnd) {
      this.sendToWebview({
        type: "toolEnd",
        toolId: result.toolEnd.id,
        output: result.toolEnd.output,
        error: result.toolEnd.error,
      });
    }

    if (result.thinking) {
      this.sendToWebview({
        type: "thinkingStart",
        thinking: result.thinking,
      });
    }

    if (result.thinkingEnd) {
      this.sendToWebview({
        type: "thinkingEnd",
        thinkingId: result.thinkingEnd.id,
      });
    }
  }

  finalizeMessage(): void {
    this.messageParser.finalizeAssistantMessage();
    this.sendToWebview({ type: "messageComplete" });
    this.sendToWebview({
      type: "chatState",
      state: this.buildChatState(),
    });
  }

  private buildChatState(): ChatState {
    return {
      messages: this.messageParser.getMessages(),
      isStreaming: this.processManager.isRunning,
      agentMode: this.agentMode,
    };
  }

  private sendToWebview(msg: ExtensionMessage): void {
    this.panel?.webview.postMessage(msg);
  }

  private getWebviewContent(): string {
    const webview = this.panel!.webview;
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist", "assets", "index.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist", "assets", "index.css")
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
  <link rel="stylesheet" type="text/css" href="${styleUri}">
  <title>OpenClaude</title>
</head>
<body class="bg-oc-bg text-oc-text">
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private disposePanel(): void {
    this.panel = undefined;
    this.processManager.kill();
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }

  dispose(): void {
    this.disposePanel();
  }
}

function getNonce(): string {
  let text = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
