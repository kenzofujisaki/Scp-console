"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  onComplete: (merchantId: string) => void;
  onBack: () => void;
  /** Show the "explore the demo instead" escape hatch (onboarding only). */
  showDemoHint?: boolean;
}

type TestState = "idle" | "testing" | "ok" | "fail";
type SaveState = "idle" | "saving";

export function ConnectStep({ onComplete, onBack, showDemoHint = true }: Props) {
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
        className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Step 2 · Connect
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          Point the Console at your SCP server
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Enter the base URL your developers set up for the Shopper Context Protocol. The Console
          discovers it, checks it responds, and then governs it — it never changes your server.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card">
        <div className="space-y-1.5">
          <Label htmlFor="merchant-name">Store name</Label>
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
          <p className="text-xs leading-relaxed text-muted-foreground">
            The address must serve{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground/80">
              /.well-known/shopper-context-protocol
            </code>
            . Your engineering team will know this.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={testConnection}
          disabled={!url || testState === "testing"}
          className="w-full"
        >
          {testState === "testing" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          {testState === "ok" ? "Test again" : "Test connection"}
        </Button>

        {testState === "ok" && (
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Endpoint verified — it&apos;s a valid SCP server. You&apos;re good to go.</span>
          </div>
        )}
        {testState === "fail" && (
          <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Couldn&apos;t reach a valid SCP server there.
              {testError ? <span className="block text-rose-600/90 dark:text-rose-400/80">{testError}</span> : null}
            </span>
          </div>
        )}

        <Button
          className="w-full"
          onClick={save}
          disabled={!url || testState !== "ok" || saveState === "saving"}
        >
          {saveState === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save &amp; open dashboard
        </Button>
      </div>

      {showDemoHint && (
        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an endpoint yet?{" "}
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Explore the demo instead
          </button>
        </p>
      )}
    </div>
  );
}
