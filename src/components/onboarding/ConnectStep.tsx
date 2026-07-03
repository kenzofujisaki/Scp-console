"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onComplete: (merchantId: string) => void;
  onBack: () => void;
}

type TestState = "idle" | "testing" | "ok" | "fail";
type SaveState = "idle" | "saving";

export function ConnectStep({ onComplete, onBack }: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [testState, setTestState] = useState<TestState>("idle");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [testError, setTestError] = useState<string | null>(null);

  const testConnection = async () => {
    if (!url) return;
    setTestState("testing");
    setTestError(null);
    try {
      const res = await fetch(`/api/scp/probe?url=${encodeURIComponent(url)}`);
      const data = (await res.json()) as { healthy: boolean; error?: string };
      if (data.healthy) {
        setTestState("ok");
      } else {
        setTestError(data.error ?? "Unknown error");
        setTestState("fail");
      }
    } catch (e: unknown) {
      setTestError(e instanceof Error ? e.message : String(e));
      setTestState("fail");
    }
  };

  const save = async () => {
    setSaveState("saving");
    try {
      const res = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "My SCP Merchant",
          scpEndpointUrl: url.trim(),
        }),
      });
      const data = (await res.json()) as { merchant?: { id: string } };
      if (data.merchant?.id) {
        onComplete(data.merchant.id);
      }
    } finally {
      setSaveState("idle");
    }
  };

  return (
    <div className="w-full max-w-md space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div>
        <h2 className="text-xl font-semibold text-slate-900">Connect your SCP server</h2>
        <p className="mt-1 text-sm text-slate-500">
          The Console will discover and verify your endpoint, then let you govern it from the
          dashboard.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="space-y-1.5">
          <Label htmlFor="merchant-name">Merchant name</Label>
          <Input
            id="merchant-name"
            placeholder="My Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="scp-url">SCP endpoint URL</Label>
          <Input
            id="scp-url"
            placeholder="https://scp.mystore.com/v1"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setTestState("idle");
            }}
            className="font-mono text-sm"
          />
          <p className="text-xs text-slate-400">
            Must serve <code>/.well-known/scp-configuration</code>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={!url || testState === "testing"}
            className="flex-1"
          >
            {testState === "testing" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : null}
            Test Connection
          </Button>
          {testState === "ok" && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Connected
            </div>
          )}
          {testState === "fail" && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <XCircle className="h-4 w-4" />
              Failed
            </div>
          )}
        </div>

        {testError && <p className="text-xs text-red-600">{testError}</p>}

        <Button
          className="w-full"
          onClick={save}
          disabled={!url || testState !== "ok" || saveState === "saving"}
        >
          {saveState === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save & Open Dashboard
        </Button>
      </div>
    </div>
  );
}
