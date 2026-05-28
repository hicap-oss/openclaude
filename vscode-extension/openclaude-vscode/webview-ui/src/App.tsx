import { VSCodeProvider } from "./context/VSCodeContext";
import { ChatProvider } from "./context/ChatContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Chat } from "./components/Chat";

export function App() {
  return (
    <ErrorBoundary>
      <VSCodeProvider>
        <ChatProvider>
          <Chat />
        </ChatProvider>
      </VSCodeProvider>
    </ErrorBoundary>
  );
}
