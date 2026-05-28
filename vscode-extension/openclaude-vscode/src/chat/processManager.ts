import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import * as readline from "readline";
import type { NDJSONMessage } from "../types";
import { parseNDJSONLine } from "../protocol";

export interface ProcessManagerEvents {
  message: (msg: NDJSONMessage) => void;
  error: (err: Error) => void;
  exit: (code: number | null) => void;
}

export class ProcessManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private rl: readline.Interface | null = null;
  private buffer = "";

  get isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }

  start(command: string, args: string[], cwd?: string): void {
    if (this.isRunning) {
      this.kill();
    }

    const fullArgs = [
      ...args,
      "--input-format=stream-json",
      "--output-format=stream-json",
      "--include-partial-messages",
    ];

    this.process = spawn(command, fullArgs, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      shell: process.platform === "win32",
    });

    this.rl = readline.createInterface({
      input: this.process.stdout!,
      crlfDelay: Infinity,
    });

    this.rl.on("line", (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const msg = parseNDJSONLine(trimmed);
      if (msg) {
        this.emit("message", msg);
      }
    });

    this.process.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      console.error("[OpenClaude stderr]", text);
    });

    this.process.on("error", (err: Error) => {
      this.emit("error", err);
      this.cleanup();
    });

    this.process.on("exit", (code: number | null) => {
      this.emit("exit", code);
      this.cleanup();
    });
  }

  send(msg: Record<string, unknown>): void {
    if (!this.isRunning || !this.process?.stdin) {
      throw new Error("Process not running");
    }

    const line = JSON.stringify(msg) + "\n";
    this.process.stdin.write(line);
  }

  sendMessage(content: string): void {
    this.send({ type: "user_message", content });
  }

  abort(): void {
    this.send({ type: "abort" });
  }

  resolvePermission(requestId: string, allow: boolean, forSession = false): void {
    this.send({
      type: "permission_response",
      id: requestId,
      allow,
      for_session: forSession,
    });
  }

  listSessions(): void {
    this.send({ type: "list_sessions" });
  }

  resumeSession(sessionId: string): void {
    this.send({ type: "resume_session", session_id: sessionId });
  }

  kill(): void {
    if (this.process) {
      this.process.kill("SIGTERM");
      // Force kill after 3 seconds if still running
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill("SIGKILL");
        }
      }, 3000);
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.rl?.close();
    this.rl = null;
    this.process = null;
  }
}
