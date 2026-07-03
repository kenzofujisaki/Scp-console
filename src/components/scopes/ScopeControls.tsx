"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SCOPE_META, SCP_SCOPES, type SCPScope } from "@/lib/scp/types";
import type { ScopeSetting } from "@/lib/db/schema";

/** Sensitivity is the risk axis — orthogonal to the exposed/withheld state axis. */
const RISK: Record<"low" | "medium" | "high", { label: string; dot: string; text: string; bars: number }> = {
  low: { label: "Low sensitivity", dot: "bg-slate-300", text: "text-muted-foreground", bars: 1 },
  medium: { label: "Medium sensitivity", dot: "bg-amber-400", text: "text-amber-700", bars: 2 },
  high: { label: "High sensitivity", dot: "bg-rose-500", text: "text-rose-700", bars: 3 },
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
    return (
      <div className="space-y-2.5">
        {SCP_SCOPES.map((s) => (
          <div key={s} className="h-[92px] animate-pulse rounded-xl border border-border/70 bg-muted/40" />
        ))}
      </div>
    );
  }

  const exposedCount = Object.values(scopes).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" strokeWidth={2} />
        <span>
          <span className="font-semibold tabular-nums text-foreground">{exposedCount}</span> of{" "}
          <span className="tabular-nums">{SCP_SCOPES.length}</span> data types exposed to AI
          assistants
        </span>
      </div>

      <div className="space-y-2.5">
        {SCP_SCOPES.map((scope: SCPScope) => {
          const meta = SCOPE_META[scope];
          const isOn = scopes[scope] ?? false;
          const isSaving = saving === scope;
          const risk = RISK[meta.risk];

          return (
            <div
              key={scope}
              className={cn(
                "relative overflow-hidden rounded-xl border bg-card p-4 pl-5 shadow-card transition-colors",
                isOn ? "border-emerald-200" : "border-border/70",
              )}
            >
              {/* State rail — emerald when live, calm slate when withheld */}
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-1 transition-colors",
                  isOn ? "bg-emerald-400" : "bg-slate-200",
                )}
              />

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-foreground">{meta.label}</span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="flex items-end gap-0.5" aria-hidden>
                        {[1, 2, 3].map((b) => (
                          <span
                            key={b}
                            className={cn(
                              "w-1 rounded-full",
                              b === 1 ? "h-1.5" : b === 2 ? "h-2.5" : "h-3.5",
                              b <= risk.bars ? risk.dot : "bg-border",
                            )}
                          />
                        ))}
                      </span>
                      <span className={cn("text-xs font-medium", risk.text)}>{risk.label}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
                  <code className="mt-1.5 inline-block font-mono text-xs text-muted-foreground/70">
                    {scope}
                  </code>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Switch
                    checked={isOn}
                    onCheckedChange={(v) => toggle(scope, v)}
                    disabled={isSaving}
                    aria-label={`Toggle ${meta.label}`}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                  <span
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      isSaving
                        ? "text-muted-foreground"
                        : isOn
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                    )}
                  >
                    {isSaving ? "Saving…" : isOn ? "Exposed" : "Blocked"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground/80">
        Changes take effect immediately on the next context request. Every toggle is recorded in the
        Audit Log with a timestamp and actor.
      </p>
    </div>
  );
}
