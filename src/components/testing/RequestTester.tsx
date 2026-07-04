"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShopperSelector, PRESET_SHOPPERS } from "@/components/context/ShopperSelector";
import { ScopeCheckboxGroup } from "@/components/context/ScopeCheckboxGroup";
import { JsonViewer } from "@/components/context/JsonViewer";
import { AiUseCases } from "@/components/context/AiUseCases";
import { RequestPreview } from "./RequestPreview";
import type { SCPProxyResult, SCPScope } from "@/lib/scp/types";

interface Props {
  endpointUrl: string;
}

export function RequestTester({ endpointUrl }: Props) {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [shopperId, setShopperId] = useState("shopper_001");
  const [scopes, setScopes] = useState<SCPScope[]>(["orders", "loyalty", "preferences"]);
  const [result, setResult] = useState<SCPProxyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runRequest = async () => {
    if (!merchantId || !shopperId) return;
    setLoading(true);
    setRan(false);
    try {
      const url = new URL("/api/scp/context", window.location.origin);
      url.searchParams.set("merchantId", merchantId);
      url.searchParams.set("shopperId", shopperId);
      url.searchParams.set("scopes", scopes.join(","));
      url.searchParams.set("actor", "Request Tester");
      const res = await fetch(url.toString());
      const data = (await res.json()) as SCPProxyResult;
      setResult(data);
      setRan(true);
    } finally {
      setLoading(false);
    }
  };

  const randomShopper = () => {
    const r = PRESET_SHOPPERS[Math.floor(Math.random() * PRESET_SHOPPERS.length)];
    if (r) setShopperId(r.id);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left: controls */}
      <div className="space-y-4">
        <ShopperSelector value={shopperId} onChange={setShopperId} />
        <Button variant="outline" size="sm" onClick={randomShopper} className="w-full">
          Random Shopper
        </Button>
        <ScopeCheckboxGroup value={scopes} onChange={setScopes} />

        <Button
          className="w-full"
          onClick={runRequest}
          disabled={loading || !merchantId || !shopperId || scopes.length === 0}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Run Request
        </Button>

        {ran && result && (
          <div className="space-y-2 rounded-xl border border-border/70 bg-card p-3 text-sm shadow-card">
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
            <p className="text-xs text-muted-foreground">
              Scopes sent: {result.filteredScopes.join(", ") || "none"}
            </p>
            {result.scopesDenied.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Withheld: {result.scopesDenied.join(", ")}
              </p>
            )}
            <p className="text-xs text-muted-foreground/70">Request logged in Audit Log ↗</p>
          </div>
        )}
      </div>

      {/* Right: preview + response */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <RequestPreview shopperId={shopperId} scopes={scopes} endpointUrl={endpointUrl} />
        <JsonViewer
          data={result?.data ?? null}
          placeholder="Request preview above. Click Run Request to execute."
        />
        <AiUseCases granted={ran && result ? result.filteredScopes : scopes} />
      </div>
    </div>
  );
}
