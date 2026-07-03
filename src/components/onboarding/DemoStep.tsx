"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  onComplete: (merchantId: string) => void;
}

type State = "loading" | "ready" | "error";

export function DemoStep({ onComplete }: Props) {
  const [state, setState] = useState<State>("loading");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (state === "loading") {
    return (
      <div className="flex items-center gap-3 text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        Setting up Acme Outdoor Co. reference merchant…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-5 w-5 shrink-0" />
        Failed to initialize demo: {error}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <CardTitle>Acme Outdoor Co. is ready</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />5 fake shoppers
            pre-loaded (Alex, Sam, Jordan, Morgan, Taylor)
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            order_history, loyalty, preferences — exposed
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            payment_methods — blocked by default
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Reference SCP server running at localhost:8787
          </li>
        </ul>
        <Button className="w-full" onClick={() => merchantId && onComplete(merchantId)}>
          Open Dashboard →
        </Button>
      </CardContent>
    </Card>
  );
}
