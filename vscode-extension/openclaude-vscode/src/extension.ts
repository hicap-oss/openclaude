import * as vscode from "vscode";
import { ChatPanelManager } from "./chat/chatPanelManager";
import { ChatViewProvider } from "./providers/chatView";
import { DiffContentProvider } from "./chat/diffController";
import { registerCommands } from "./commands";

export function activate(context: vscode.ExtensionContext): void {
  console.log("OpenClaude extension activating...");

  const extensionUri = context.extensionUri;

  // Create core services
  const chatPanelManager = new ChatPanelManager(extensionUri);
  const chatView = new ChatViewProvider(extensionUri, chatPanelManager);
  const diffProvider = new DiffContentProvider();

  // Register diff content provider
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider("openclaude-diff", diffProvider)
  );

  // Register webview view providers
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatView)
  );

  // Register all commands
  registerCommands(context, chatPanelManager);

  // Register disposables
  context.subscriptions.push(chatPanelManager);
  context.subscriptions.push(chatView);
  context.subscriptions.push(diffProvider);

  console.log("OpenClaude extension activated");
}

export function deactivate(): void {
  console.log("OpenClaude extension deactivated");
}
