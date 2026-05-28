import * as vscode from "vscode";
import type { WebviewMessage, ExtensionMessage, ChatState } from "../types";
import { ChatPanelManager } from "../chat/chatPanelManager";

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "openclaude.chat";
  private view?: vscode.WebviewView;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private extensionUri: vscode.Uri,
    private chatPanelManager: ChatPanelManager
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "webview-ui", "dist"),
      ],
    };

    webviewView.webview.html = this.getWebviewContent();

    webviewView.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this.handleMessage(msg),
      null,
      this.disposables
    );
  }

  private async handleMessage(msg: WebviewMessage): Promise<void> {
    // Forward all messages to the chat panel manager
    // The sidebar view acts as a secondary entry point
    switch (msg.type) {
      case "openSettings":
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "@ext:devnull-bootloader.openclaude-vscode"
        );
        break;

      default:
        // Forward to chat panel manager
        break;
    }
  }

  private getWebviewContent(): string {
    const webview = this.view!.webview;
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
  <title>OpenClaude Chat</title>
</head>
<body class="bg-oc-bg text-oc-text">
  <div id="root" data-view="chat"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
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
