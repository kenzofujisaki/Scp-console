"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SCOPE_META, SCP_SCOPES, type SCPScope } from "@/lib/scp/types";
import type { ScopeSetting } from "@/lib/db/schema";

const RISK_BADGE: Record<string, "success" | "warning" | "destructive"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
};

export function ScopeControls() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [scopes, setScopes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!merchantId) return;
    fetch(`/api/scopes?merchantId=${merchantId}`)
      .then((r) => r.json())
      .then((data: { scopes: ScopeSetting[] }) => {
        const map: Record<string, boolean> = {};
        for (const row of data.scopes) map[row.dataType] = row.exposed;
        setScopes(map);
        setLoading(false);
      });
  }, [merchantId]);

  const toggle = async (dataType: string, newValue: boolean) => {
    setSaving(dataType);
    setScopes((prev) => ({ ...prev, [dataType]: newValue }));
    await fetch("/api/scopes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchantId, dataType, exposed: newValue }),
    });
    setSaving(null);
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Loading scope policy…</div>;
  }

  const exposedCount = Object.values(scopes).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Shield className="h-4 w-4" />
        <span>
          {exposedCount} of {SCP_SCOPES.length} data types currently exposed to AI assistants
        </span>
      </div>

      <div className="space-y-2">
        {SCP_SCOPES.map((scope: SCPScope) => {
          const meta = SCOPE_META[scope];
          const isOn = scopes[scope] ?? false;
          const isSaving = saving === scope;

          return (
            <div
              key={scope}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{meta.label}</span>
                  <Badge variant={RISK_BADGE[meta.risk] ?? "outline"}>
                    {meta.risk} sensitivity
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{meta.description}</p>
                <code className="text-xs text-slate-400">{scope}</code>
              </div>

              <div className="ml-4 flex flex-col items-end gap-1">
                <Switch
                  checked={isOn}
                  onCheckedChange={(v) => toggle(scope, v)}
                  disabled={isSaving}
                  aria-label={`Toggle ${meta.label}`}
                />
                <span className="text-xs text-slate-400">
                  {isSaving ? "Saving…" : isOn ? "Exposed" : "Blocked"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">
        Changes take effect immediately on the next context request. Every toggle is recorded in
        the Audit Log with a timestamp and actor.
      </p>
    </div>
  );
}
