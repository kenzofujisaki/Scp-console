"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopperSelector, PRESET_SHOPPERS } from "./ShopperSelector";
import { ScopeCheckboxGroup } from "./ScopeCheckboxGroup";
import { JsonViewer } from "./JsonViewer";
import type { SCPProxyResult, SCPScope } from "@/lib/scp/types";

export function ContextBrowser() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [shopperId, setShopperId] = useState("shopper_001");
  const [scopes, setScopes] = useState<SCPScope[]>(["order_history", "loyalty"]);
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
        <ShopperSelector value={shopperId} onChange={setShopperId} />
        <Button variant="outline" size="sm" onClick={randomShopper} className="w-full">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Random Shopper
        </Button>
        <ScopeCheckboxGroup value={scopes} onChange={setScopes} />
        <Button
          className="w-full"
          onClick={fetchContext}
          disabled={loading || !merchantId || !shopperId}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fetch Context
        </Button>

        {result && (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={result.status < 400 ? "success" : "destructive"}>
                HTTP {result.status}
              </Badge>
              <Badge variant="outline">{result.latencyMs}ms</Badge>
            </div>
            {result.scopesDenied.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-amber-700">Blocked by scope policy:</p>
                <div className="flex flex-wrap gap-1">
                  {result.scopesDenied.map((s) => (
                    <Badge key={s} variant="warning">
                      {s}
                    </Badge>
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
