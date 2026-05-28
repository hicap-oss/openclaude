import { Shield, Check, X, CheckCheck } from "lucide-react";
import type { PermissionRequest } from "../types";
import { Button } from "./ui/Button";

interface PermissionCardProps {
  request: PermissionRequest;
  onAllow: (id: string) => void;
  onDeny: (id: string) => void;
  onAllowForSession: (id: string) => void;
}

export function PermissionCard({
  request,
  onAllow,
  onDeny,
  onAllowForSession,
}: PermissionCardProps) {
  return (
    <div className="rounded-lg border border-oc-warning/50 bg-oc-warning/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-oc-warning" />
        <span className="text-sm font-medium text-oc-text">
          Permission Required
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm text-oc-text">{request.description}</p>
        {request.input && (
          <pre className="text-xs bg-oc-surface p-2 rounded overflow-x-auto font-mono max-h-[100px]">
            {request.input}
          </pre>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={() => onAllow(request.id)}
        >
          <Check className="w-3 h-3 mr-1" />
          Allow
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDeny(request.id)}
        >
          <X className="w-3 h-3 mr-1" />
          Deny
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAllowForSession(request.id)}
        >
          <CheckCheck className="w-3 h-3 mr-1" />
          Allow for Session
        </Button>
      </div>
    </div>
  );
}
