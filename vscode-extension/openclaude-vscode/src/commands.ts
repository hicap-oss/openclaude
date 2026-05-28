import * as vscode from "vscode";
import { ChatPanelManager } from "./chat/chatPanelManager";
import { getSettings, getLaunchDirectory } from "./state";

export function registerCommands(
  context: vscode.ExtensionContext,
  chatPanelManager: ChatPanelManager
): void {
  // Launch in Terminal (project-aware)
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.start", () => {
      const settings = getSettings();
      const cwd = getLaunchDirectory();
      launchInTerminal(settings.launchCommand, settings.terminalName, cwd, settings.useOpenAIShim);
    })
  );

  // Launch in Workspace Root
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.startInWorkspaceRoot", () => {
      const settings = getSettings();
      const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      launchInTerminal(settings.launchCommand, settings.terminalName, cwd, settings.useOpenAIShim);
    })
  );

  // Open Repository
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.openDocs", () => {
      vscode.env.openExternal(vscode.Uri.parse("https://github.com/hicap-oss/openclaude"));
    })
  );

  // Open Setup Guide
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.openSetupDocs", () => {
      vscode.env.openExternal(
        vscode.Uri.parse("https://github.com/hicap-oss/openclaude#readme")
      );
    })
  );

  // Open Workspace Profile
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.openWorkspaceProfile", async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showWarningMessage("No workspace folder open");
        return;
      }

      const profileUri = vscode.Uri.joinPath(workspaceFolder.uri, ".openclaude-profile.json");
      try {
        await vscode.workspace.openTextDocument(profileUri);
        await vscode.window.showTextDocument(profileUri);
      } catch {
        const create = await vscode.window.showInformationMessage(
          "No workspace profile found. Create one?",
          "Create",
          "Cancel"
        );
        if (create === "Create") {
          const content = JSON.stringify({ provider: "anthropic" }, null, 2);
          await vscode.workspace.fs.writeFile(profileUri, Buffer.from(content));
          await vscode.window.showTextDocument(profileUri);
        }
      }
    })
  );

  // New Chat
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.newChat", async () => {
      await chatPanelManager.openPanel();
    })
  );

  // Open Chat Panel
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.openChat", async () => {
      await chatPanelManager.openPanel();
    })
  );

  // Resume Session
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.resumeSession", async () => {
      // TODO: Show session picker and resume
      await chatPanelManager.openPanel();
    })
  );

  // Abort Chat
  context.subscriptions.push(
    vscode.commands.registerCommand("openclaude.abortChat", () => {
      // Handled via webview message
    })
  );
}

function launchInTerminal(
  command: string,
  terminalName: string,
  cwd?: string,
  useOpenAIShim?: boolean
): void {
  const terminal = vscode.window.createTerminal({
    name: terminalName,
    cwd,
    env: useOpenAIShim ? { CLAUDE_CODE_USE_OPENAI: "1" } : undefined,
  });
  terminal.sendText(command);
  terminal.show();
}
