"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopperSelector, PRESET_SHOPPERS } from "@/components/context/ShopperSelector";
import { ScopeCheckboxGroup } from "@/components/context/ScopeCheckboxGroup";
import { JsonViewer } from "@/components/context/JsonViewer";
import { RequestPreview } from "./RequestPreview";
import type { SCPProxyResult, SCPScope } from "@/lib/scp/types";

interface Props {
  endpointUrl: string;
}

export function RequestTester({ endpointUrl }: Props) {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [shopperId, setShopperId] = useState("shopper_001");
  const [scopes, setScopes] = useState<SCPScope[]>(["order_history", "loyalty", "preferences"]);
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
          <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={result.status < 400 ? "success" : "destructive"}>
                HTTP {result.status}
              </Badge>
              <Badge variant="outline">{result.latencyMs}ms</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Scopes sent: {result.filteredScopes.join(", ") || "none"}
            </p>
            {result.scopesDenied.length > 0 && (
              <p className="text-xs text-amber-700">
                Blocked: {result.scopesDenied.join(", ")}
              </p>
            )}
            <p className="text-xs text-slate-400">Request logged in Audit Log ↗</p>
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
      </div>
    </div>
  );
}
