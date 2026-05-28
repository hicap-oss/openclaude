import React from "react";
import { Clock, MessageSquare, Search } from "lucide-react";
import type { SessionInfo } from "../types";
import { Input } from "./ui/Input";
import { ScrollArea } from "./ui/ScrollArea";

interface SessionListProps {
  sessions: SessionInfo[];
  onResume: (sessionId: string) => void;
}

export function SessionList({ sessions, onResume }: SessionListProps) {
  const [search, setSearch] = React.useState("");

  const filtered = sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-oc-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-oc-text-dim" />
          <Input
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-oc-text-muted text-sm">
              No sessions found
            </div>
          ) : (
            filtered.map((session) => (
              <button
                key={session.id}
                onClick={() => onResume(session.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-oc-card transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-oc-text group-hover:text-oc-accent">
                    {session.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-oc-text-dim">
                    <MessageSquare className="w-3 h-3" />
                    {session.messageCount}
                  </div>
                </div>
                <p className="text-xs text-oc-text-muted truncate">
                  {session.preview}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-oc-text-dim">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(session.timestamp)}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString();
}
