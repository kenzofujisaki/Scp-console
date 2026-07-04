"use client";

import { Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCOPE_META, type SCPScope } from "@/lib/scp/types";

/**
 * Product-facing panel: concrete things an AI assistant can do once this
 * merchant's context is connected. Each example is powered by one or more
 * scopes; examples are "unlocked" only when every scope they need is granted,
 * which makes the scope model tangible ("grant Offers to unlock this").
 */

interface Example {
  prompt: string;
  outcome: string;
  requires: SCPScope[];
}

const EXAMPLES: Example[] = [
  {
    prompt: "Where's my last order — has it shipped yet?",
    outcome: "Pulls the latest order, its status, and tracking number.",
    requires: ["orders"],
  },
  {
    prompt: "Reorder the trail runners I bought in the spring.",
    outcome: "Finds the past purchase and starts a repeat order.",
    requires: ["orders"],
  },
  {
    prompt: "How many points until I reach Gold, and what do I unlock?",
    outcome: "Reads the loyalty balance and tier benefits.",
    requires: ["loyalty"],
  },
  {
    prompt: "Apply my best available discount to this rain jacket.",
    outcome: "Matches active offers to the cart and applies the strongest one.",
    requires: ["offers"],
  },
  {
    prompt: "Recommend hiking boots in my size from brands I like.",
    outcome: "Filters catalog by saved sizes and favorite brands.",
    requires: ["preferences"],
  },
  {
    prompt: "Plan a birthday gift under $100 based on my history and tastes.",
    outcome: "Combines past orders with preferences for a tailored pick.",
    requires: ["orders", "preferences"],
  },
];

interface Props {
  /** Scopes currently granted — examples needing only these are unlocked. */
  granted: SCPScope[];
}

export function AiUseCases({ granted }: Props) {
  const grantedSet = new Set(granted);

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-card">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground">
          What an AI assistant can do with this context
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Real requests a shopper could make. Each is powered by the scopes you grant — the rest stay
        locked until you connect them.
      </p>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {EXAMPLES.map((ex) => {
          const missing = ex.requires.filter((s) => !grantedSet.has(s));
          const unlocked = missing.length === 0;
          return (
            <li
              key={ex.prompt}
              className={cn(
                "flex flex-col gap-2 rounded-lg border p-3 transition-colors",
                unlocked
                  ? "border-primary/25 bg-primary/[0.03]"
                  : "border-border/60 bg-muted/30",
              )}
            >
              <p
                className={cn(
                  "text-sm font-medium",
                  unlocked ? "text-foreground" : "text-muted-foreground",
                )}
              >
                &ldquo;{ex.prompt}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">{ex.outcome}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-0.5">
                {ex.requires.map((s) => {
                  const has = grantedSet.has(s);
                  return (
                    <span
                      key={s}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                        has
                          ? "bg-primary/10 text-primary ring-primary/20"
                          : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
                      )}
                    >
                      {SCOPE_META[s].label}
                    </span>
                  );
                })}
                {!unlocked && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" aria-hidden />
                    Grant {missing.map((s) => SCOPE_META[s].label).join(" + ")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
