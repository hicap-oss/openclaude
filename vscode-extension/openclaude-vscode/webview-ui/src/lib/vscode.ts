import type { WebviewMessage } from "../types";

// VS Code API type declaration
interface VSCodeApi {
  postMessage(msg: WebviewMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

// Acquire VS Code API (only available inside webview)
function acquireVsCodeApi(): VSCodeApi {
  if (typeof window === "undefined") {
    throw new Error("acquireVsCodeApi is only available inside a VS Code webview");
  }
  return (window as unknown as { acquireVsCodeApi: () => VSCodeApi }).acquireVsCodeApi();
}

let vscode: VSCodeApi | null = null;

function getVSCodeApi(): VSCodeApi {
  if (!vscode) {
    try {
      vscode = acquireVsCodeApi();
    } catch {
      // Fallback for development outside VS Code
      console.warn("Running outside VS Code webview - postMessage will be no-op");
      vscode = {
        postMessage: () => {},
        getState: () => undefined,
        setState: () => {},
      };
    }
  }
  return vscode;
}

export function postMessage(msg: WebviewMessage): void {
  getVSCodeApi().postMessage(msg);
}

export function getState<T>(): T | undefined {
  return getVSCodeApi().getState() as T | undefined;
}

export function setState<T>(state: T): void {
  getVSCodeApi().setState(state);
}
