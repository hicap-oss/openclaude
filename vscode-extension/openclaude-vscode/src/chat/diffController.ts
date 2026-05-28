import * as vscode from "vscode";

export class DiffContentProvider implements vscode.TextDocumentContentProvider {
  private content = new Map<string, string>();

  onDidChange?: vscode.Event<vscode.Uri>;

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChangeInternal = this._onDidChange.event;

  constructor() {
    this.onDidChange = this._onDidChange.event;
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.content.get(uri.toString()) ?? "";
  }

  setDiffContent(uri: vscode.Uri, content: string): void {
    this.content.set(uri.toString(), content);
    this._onDidChange.fire(uri);
  }

  clearDiffContent(uri: vscode.Uri): void {
    this.content.delete(uri.toString());
  }

  dispose(): void {
    this.content.clear();
    this._onDidChange.dispose();
  }
}

export function createDiffUri(filePath: string, content: string): vscode.Uri {
  return vscode.Uri.parse(`openclaude-diff:${encodeURIComponent(filePath)}`);
}

export async function showDiff(
  provider: DiffContentProvider,
  filePath: string,
  newContent: string
): Promise<void> {
  const uri = createDiffUri(filePath, newContent);
  provider.setDiffContent(uri, newContent);

  // Try to show diff against current file
  try {
    const currentDoc = await vscode.workspace.openTextDocument(filePath);
    await vscode.commands.executeCommand(
      "vscode.diff",
      currentDoc.uri,
      uri,
      `OpenClaude: ${filePath.split("/").pop()}`
    );
  } catch {
    // If file doesn't exist, just show the new content
    await vscode.window.showTextDocument(uri, { preview: true });
  }
}
