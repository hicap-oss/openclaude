import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import type { ControlCenterState, ExtensionSettings, AgentMode, PermissionMode } from "./types";

// Get extension settings
export function getSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration("openclaude");
  return {
    launchCommand: config.get<string>("launchCommand", "openclaude"),
    terminalName: config.get<string>("terminalName", "OpenClaude"),
    useOpenAIShim: config.get<boolean>("useOpenAIShim", false),
    permissionMode: config.get<PermissionMode>("permissionMode", "acceptEdits"),
    agentMode: config.get<AgentMode>("agentMode", "code"),
  };
}

// Check if CLI is found on PATH
export function findCLI(command: string): { found: boolean; path?: string } {
  try {
    const isWin = process.platform === "win32";
    const cmd = isWin ? `where ${command}` : `which ${command}`;
    const result = execSync(cmd, { encoding: "utf-8", timeout: 5000 }).trim();
    return { found: true, path: result.split("\n")[0] };
  } catch {
    return { found: false };
  }
}

// Detect provider from workspace profile
export function detectProvider(): string | undefined {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return undefined;

  const profilePath = path.join(workspaceFolder.uri.fsPath, ".openclaude-profile.json");
  try {
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, "utf-8"));
      return profile.provider;
    }
  } catch {
    // ignore
  }

  // Check environment variables
  const envProviderMap: [string, string][] = [
    ["OPENAI_API_KEY", "OpenAI"],
    ["ANTHROPIC_API_KEY", "Anthropic"],
    ["GEMINI_API_KEY", "Gemini"],
    ["DEEPSEEK_API_KEY", "DeepSeek"],
    ["OPENROUTER_API_KEY", "OpenRouter"],
  ];

  for (const [envVar, provider] of envProviderMap) {
    if (process.env[envVar]) return provider;
  }

  return undefined;
}

// Check if workspace profile exists and is valid
export function checkProfile(): { exists: boolean; valid: boolean } {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return { exists: false, valid: false };

  const profilePath = path.join(workspaceFolder.uri.fsPath, ".openclaude-profile.json");
  try {
    if (fs.existsSync(profilePath)) {
      const content = fs.readFileSync(profilePath, "utf-8");
      JSON.parse(content);
      return { exists: true, valid: true };
    }
  } catch {
    return { exists: true, valid: false };
  }

  return { exists: false, valid: false };
}

// Build full control center state
export async function buildControlCenterState(): Promise<ControlCenterState> {
  const settings = getSettings();
  const cli = findCLI(settings.launchCommand);
  const provider = detectProvider();
  const profile = checkProfile();
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  return {
    cliFound: cli.found,
    cliPath: cli.path,
    provider,
    workspaceFolder: workspaceFolder?.uri.fsPath,
    profileExists: profile.exists,
    profileValid: profile.valid,
  };
}

// Get the active workspace directory for launching
export function getLaunchDirectory(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
    if (workspaceFolder) {
      return path.dirname(activeEditor.document.uri.fsPath);
    }
  }
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
