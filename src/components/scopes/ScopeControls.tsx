"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCOPE_META, SCP_SCOPES, type SCPScope } from "@/lib/scp/types";
import type { ScopeSetting } from "@/lib/db/schema";

/** Sensitivity is the risk axis — orthogonal to the exposed/withheld state axis. */
const RISK: Record<"low" | "medium" | "high", { label: string; dot: string; text: string; bars: number }> = {
  low: { label: "Low sensitivity", dot: "bg-slate-300", text: "text-muted-foreground", bars: 1 },
  medium: { label: "Medium sensitivity", dot: "bg-amber-400", text: "text-amber-700", bars: 2 },
  high: { label: "High sensitivity", dot: "bg-rose-500", text: "text-rose-700", bars: 3 },
};

/** The scope the first-run coach-mark points at (blocked by default in the demo). */
const COACH_SCOPE: SCPScope = "offers";
const COACH_STORAGE_KEY = "scp-coached";

export function ScopeControls() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [scopes, setScopes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [coaching, setCoaching] = useState(false);

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

  useEffect(() => {
    if (searchParams.get("coach") !== "1") return;
    try {
      if (localStorage.getItem(COACH_STORAGE_KEY) === "1") return;
    } catch {
      /* localStorage unavailable — still show the coach-mark this session */
    }
    setCoaching(true);
  }, [searchParams]);

  const dismissCoach = () => {
    setCoaching(false);
    try {
      localStorage.setItem(COACH_STORAGE_KEY, "1");
    } catch {
      /* no-op */
    }
  };

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
  const coachScopeOn = scopes[COACH_SCOPE] ?? false;

  return (
    <div className="space-y-4">
      {/* Spotlight backdrop — dims the page and focuses attention on one control.
          Intentionally not click-to-dismiss, so a stray click can't fizzle the
          moment; dismissal is via the explicit controls in the coach-mark. */}
      {coaching && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px] animate-in-up"
          aria-hidden
        />
      )}

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
          const isCoachTarget = coaching && scope === COACH_SCOPE;

          return (
            <div key={scope} className={cn("relative", isCoachTarget && "z-50")}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-card p-4 pl-5 shadow-card transition-all",
                  isOn ? "border-emerald-200 dark:border-emerald-500/30" : "border-border/70",
                  isCoachTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                {/* State rail — emerald when live, calm slate when withheld */}
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 w-1 transition-colors",
                    isOn ? "bg-emerald-400" : "bg-border",
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

              {isCoachTarget && (
                <CoachMark
                  active={coachScopeOn}
                  merchantId={merchantId}
                  onDismiss={dismissCoach}
                />
              )}
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

/**
 * First-run coach-mark anchored beneath the target scope. Two beats: before the
 * flip it explains the control; after the flip it lands the payoff and points at
 * the Request Tester so the user sees the effect in a real response.
 */
function CoachMark({
  active,
  merchantId,
  onDismiss,
}: {
  active: boolean;
  merchantId: string;
  onDismiss: () => void;
}) {
  return (
    <div className="animate-in-up absolute left-4 right-4 top-full z-50 mt-3 sm:left-auto sm:right-0 sm:w-80">
      {/* Pointer */}
      <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 border-l border-t border-primary/20 bg-popover sm:right-10" />
      <div className="rounded-xl border border-primary/20 bg-popover p-4 shadow-elevated">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {active ? "That's the whole idea" : "Try it — you're in control"}
          </p>
        </div>

        {active ? (
          <>
            <p className="mt-2.5 text-sm font-medium text-foreground">Offers are now live to AI.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              You just changed what every assistant can access — and the change is already in your
              audit log. See it land in a real response:
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" asChild>
                <Link href={`/dashboard/test?merchantId=${merchantId}`} onClick={onDismiss}>
                  Open the Request Tester
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Got it
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2.5 text-sm font-medium text-foreground">
              Personalised offers are switched off.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Right now AI assistants can&apos;t see them. Flip the switch above and every future
              request includes them — instantly, no redeploy.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <ArrowRight className="h-3.5 w-3.5 -rotate-90" />
                Flip &ldquo;Offers&rdquo; above
              </span>
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
