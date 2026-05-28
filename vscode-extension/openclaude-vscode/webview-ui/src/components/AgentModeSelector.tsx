import React from "react";
import { Code, Layers, Bug, HelpCircle } from "lucide-react";
import type { AgentMode } from "../types";
import { cn } from "../lib/utils";

interface AgentModeSelectorProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
}

const modes: Array<{
  id: AgentMode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "code",
    label: "Code",
    description: "General-purpose coding with full tool access",
    icon: <Code className="w-4 h-4" />,
  },
  {
    id: "architect",
    label: "Architect",
    description: "Planning and design focused mode",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "debug",
    label: "Debug",
    description: "Enhanced diagnostic and debugging tools",
    icon: <Bug className="w-4 h-4" />,
  },
  {
    id: "ask",
    label: "Ask",
    description: "Read-only Q&A without file modifications",
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export function AgentModeSelector({
  currentMode,
  onModeChange,
}: AgentModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-oc-surface rounded-lg">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            currentMode === mode.id
              ? "bg-oc-accent text-white shadow-sm"
              : "text-oc-text-muted hover:text-oc-text hover:bg-oc-card"
          )}
          title={mode.description}
        >
          {mode.icon}
          {mode.label}
        </button>
      ))}
    </div>
  );
}
