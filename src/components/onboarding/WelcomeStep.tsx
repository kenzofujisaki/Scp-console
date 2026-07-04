"use client";

import { ArrowRight, Check, Lock, ScrollText, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSelectDemo: () => void;
  onSelectConnect: () => void;
}

const PREVIEW_SCOPES: { name: string; label: string; exposed: boolean }[] = [
  { name: "orders", label: "Order history", exposed: true },
  { name: "loyalty", label: "Loyalty & points", exposed: true },
  { name: "offers", label: "Personalised offers", exposed: false },
  { name: "preferences", label: "Sizes & preferences", exposed: true },
];

const TRUST = ["Self-hosted", "No account required", "No personal data stored"];

export function WelcomeStep({ onSelectDemo, onSelectConnect }: Props) {
  return (
    <div className="w-full max-w-5xl">
      {/* Brand lockup */}
      <div className="mb-10 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-sm">
          S
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold text-foreground">SCP Console</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">
            Control plane for the Shopper Context Protocol
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        {/* Value proposition */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground ring-1 ring-inset ring-primary/15">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Governance for AI shopping assistants
          </span>

          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl">
            You decide what customer data AI can see.
          </h1>

          <p className="text-base leading-relaxed text-muted-foreground">
            Shopping assistants can pull your customers&apos; orders, loyalty, and preferences
            through the Shopper Context Protocol. SCP Console shows you exactly what&apos;s exposed,
            lets you switch any of it off in one click, and logs every request — without ever
            storing personal data.
          </p>

          <div className="space-y-3 pt-1">
            <Button size="lg" className="w-full sm:w-auto" onClick={onSelectDemo}>
              Explore the live demo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <p className="text-xs text-muted-foreground">
              Opens instantly with a sample store and 5 shoppers. No signup, no setup.
            </p>
          </div>

          <div className="border-t border-border/70 pt-4">
            <button
              type="button"
              onClick={onSelectConnect}
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Server className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              I already have an SCP server — connect it
              <ArrowRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        {/* Product preview — a truthful mirror of the real scope-policy panel */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/5 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-elevated">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground">What AI can access</p>
                <p className="text-xs text-muted-foreground">Acme Outdoor Co. · live policy</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            </div>

            <ul className="divide-y divide-border/50 px-5">
              {PREVIEW_SCOPES.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{s.label}</p>
                    <code className="font-mono text-xs text-muted-foreground/70">{s.name}</code>
                  </div>
                  {s.exposed ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Exposed
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      Withheld
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 border-t border-border/60 bg-muted/40 px-5 py-3 text-xs text-muted-foreground">
              <ScrollText className="h-3.5 w-3.5" />
              Every request is recorded in the audit log — metadata only.
            </div>
          </div>
        </div>
      </div>

      {/* Trust row */}
      <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Private by design
        </span>
        {TRUST.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
