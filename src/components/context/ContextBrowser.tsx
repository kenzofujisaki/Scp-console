"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShopperSelector, PRESET_SHOPPERS } from "./ShopperSelector";
import { ScopeCheckboxGroup } from "./ScopeCheckboxGroup";
import { JsonViewer } from "./JsonViewer";
import type { SCPProxyResult, SCPScope } from "@/lib/scp/types";

export function ContextBrowser() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [shopperId, setShopperId] = useState("shopper_001");
  const [scopes, setScopes] = useState<SCPScope[]>(["orders", "loyalty"]);
  const [result, setResult] = useState<SCPProxyResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchContext = async () => {
    if (!merchantId || !shopperId) return;
    setLoading(true);
    try {
      const url = new URL("/api/scp/context", window.location.origin);
      url.searchParams.set("merchantId", merchantId);
      url.searchParams.set("shopperId", shopperId);
      url.searchParams.set("scopes", scopes.join(","));
      url.searchParams.set("actor", "Context Browser");
      const res = await fetch(url.toString());
      const data = (await res.json()) as SCPProxyResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const randomShopper = () => {
    const random = PRESET_SHOPPERS[Math.floor(Math.random() * PRESET_SHOPPERS.length)];
    if (random) setShopperId(random.id);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Controls */}
      <div className="space-y-4">
        <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4 shadow-card">
          <ShopperSelector value={shopperId} onChange={setShopperId} />
          <Button variant="outline" size="sm" onClick={randomShopper} className="w-full">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Random Shopper
          </Button>
          <div className="h-px bg-border" />
          <ScopeCheckboxGroup value={scopes} onChange={setScopes} />
          <Button
            className="w-full"
            onClick={fetchContext}
            disabled={loading || !merchantId || !shopperId}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Fetch Context
          </Button>
        </div>

        {result && (
          <div className="space-y-2.5 rounded-xl border border-border/70 bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                  result.status < 400
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    result.status < 400 ? "bg-emerald-500" : "bg-rose-500",
                  )}
                />
                HTTP {result.status}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
                {result.latencyMs}ms
              </span>
            </div>
            {result.scopesDenied.length > 0 && (
              <div className="space-y-1.5 border-t border-border/60 pt-2.5">
                <p className="text-xs font-medium text-muted-foreground">Withheld by scope policy</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.scopesDenied.map((s) => (
                    <code
                      key={s}
                      className="rounded-md bg-amber-50 px-1.5 py-0.5 font-mono text-xs text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400"
                    >
                      {s}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response */}
      <div className="lg:col-span-2">
        <JsonViewer
          data={result?.data ?? null}
          placeholder="Select a shopper, choose scopes, and click Fetch Context"
        />
      </div>
    </div>
  );
}
