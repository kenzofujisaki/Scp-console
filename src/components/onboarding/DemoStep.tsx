"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, RotateCw, Search, ShieldOff, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: (merchantId: string) => void;
}

type State = "loading" | "ready" | "error";

const CAN_DO: { icon: LucideIcon; text: string }[] = [
  { icon: Search, text: "See exactly what an AI assistant receives for any shopper" },
  { icon: ShieldOff, text: "Switch a data type off and watch it vanish from the response" },
  { icon: Check, text: "Review a full audit trail of every request" },
];

export function DemoStep({ onComplete }: Props) {
  const [state, setState] = useState<State>("loading");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(() => {
    setState("loading");
    setError(null);
    fetch("/api/init", { method: "POST" })
      .then((r) => r.json())
      .then((data: { merchant?: { id: string } }) => {
        if (!data.merchant?.id) throw new Error("Unexpected response from /api/init");
        setMerchantId(data.merchant.id);
        setState("ready");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setState("error");
      });
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  if (state === "loading") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-card">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-foreground">Setting up your demo store…</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Seeding Acme Outdoor Co. with 5 sample shoppers. This only takes a moment.
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Couldn&apos;t set up the demo</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4 w-full" onClick={init}>
          <RotateCw className="mr-1.5 h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-in-up rounded-2xl border border-border/70 bg-card p-6 shadow-elevated">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Your demo store is ready
          </h2>
          <p className="text-xs text-muted-foreground">Acme Outdoor Co. · sample data only</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Everything here is fake, so explore freely. From the dashboard you can:
      </p>

      <ul className="mt-3 space-y-2.5">
        {CAN_DO.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Icon className="h-3 w-3" strokeWidth={2.5} />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        Tip: <code className="font-mono text-foreground/80">offers</code> is blocked by default —
        turn it on in Scope Controls to watch personalised promotions appear.
      </div>

      <Button className="mt-5 w-full" onClick={() => merchantId && onComplete(merchantId)}>
        Open the dashboard
        <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </div>
  );
}
