import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ExtensionMessage } from "../types";
import { postMessage } from "../lib/vscode";

interface VSCodeContextValue {
  postMessage: typeof postMessage;
  lastMessage: ExtensionMessage | null;
}

const VSCodeContext = createContext<VSCodeContextValue>({
  postMessage,
  lastMessage: null,
});

export function VSCodeProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<ExtensionMessage | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      setLastMessage(event.data);
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <VSCodeContext.Provider value={{ postMessage, lastMessage }}>
      {children}
    </VSCodeContext.Provider>
  );
}

export function useVSCode() {
  return useContext(VSCodeContext);
}
