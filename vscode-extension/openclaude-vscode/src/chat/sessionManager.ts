import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import type { SessionInfo } from "../types";

export class SessionManager {
  private sessionsDir: string;

  constructor() {
    this.sessionsDir = path.join(os.homedir(), ".openclaude", "projects");
  }

  async listSessions(projectPath?: string): Promise<SessionInfo[]> {
    try {
      if (!fs.existsSync(this.sessionsDir)) {
        return [];
      }

      const sessions: SessionInfo[] = [];
      const entries = fs.readdirSync(this.sessionsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const sessionDir = path.join(this.sessionsDir, entry.name);
        const jsonlFiles = fs.readdirSync(sessionDir).filter((f) => f.endsWith(".jsonl"));

        for (const file of jsonlFiles) {
          const filePath = path.join(sessionDir, file);
          try {
            const stat = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, "utf-8");
            const lines = content.trim().split("\n").filter(Boolean);

            if (lines.length === 0) continue;

            // Parse first and last messages for preview
            const firstMsg = JSON.parse(lines[0]);
            const lastMsg = JSON.parse(lines[lines.length - 1]);

            sessions.push({
              id: `${entry.name}/${file}`,
              name: entry.name,
              timestamp: stat.mtimeMs,
              messageCount: lines.length,
              preview: this.extractPreview(firstMsg, lastMsg),
            });
          } catch {
            // Skip malformed session files
          }
        }
      }

      // Sort by most recent first
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  async loadSession(sessionId: string): Promise<Record<string, unknown>[]> {
    const [project, file] = sessionId.split("/");
    const filePath = path.join(this.sessionsDir, project, file);

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return content
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    } catch {
      return [];
    }
  }

  private extractPreview(
    first: Record<string, unknown>,
    last: Record<string, unknown>
  ): string {
    const firstContent = (first?.content as string) || "";
    const lastContent = (last?.content as string) || "";

    // Use first user message as preview, truncated
    if (firstContent.length > 100) {
      return firstContent.slice(0, 100) + "...";
    }
    return firstContent || lastContent.slice(0, 100) || "Empty session";
  }
}
