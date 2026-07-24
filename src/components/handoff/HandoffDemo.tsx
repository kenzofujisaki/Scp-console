"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorefrontPanel } from "./StorefrontPanel";
import type { SCPIntent, SCPIntentInput, SCPProduct } from "@/lib/scp/types";
import type { ScopeSetting } from "@/lib/db/schema";

// Fixed demo shopper — Acme's reference customer for the handoff.
const SHOPPER_ID = "shopper_003";
const SHOPPER_NAME = "Jordan Park";

const SUGGESTIONS = [
  "I need boots for the Houston Rodeo in March — men's 11, brown leather",
  "Looking for a warm jacket for a ski trip next month",
  "Something for hiking the Cascades this summer",
];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface StorefrontState {
  intent: SCPIntent | null;
  products: SCPProduct[];
  denied: boolean;
}

export function HandoffDemo() {
  const merchantId = useSearchParams().get("merchantId") ?? "";

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [captured, setCaptured] = useState<SCPIntentInput | null>(null);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [handingOff, setHandingOff] = useState(false);

  const [storefront, setStorefront] = useState<StorefrontState | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);

  const [intentSharing, setIntentSharing] = useState(true);
  const [togglingSharing, setTogglingSharing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Reflect the merchant's current intent-scope policy in the toggle.
  useEffect(() => {
    if (!merchantId) return;
    fetch(`/api/scopes?merchantId=${merchantId}`)
      .then((r) => r.json())
      .then((data: { scopes: ScopeSetting[] }) => {
        const intentRow = data.scopes.find((s) => s.dataType === "intent");
        if (intentRow) setIntentSharing(intentRow.exposed);
      })
      .catch(() => {});
  }, [merchantId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, captured]);

  const loadStorefront = useCallback(async () => {
    if (!merchantId) return;
    setStoreLoading(true);
    try {
      const res = await fetch(
        `/api/scp/intent?merchantId=${merchantId}&shopperId=${SHOPPER_ID}`,
      );
      const data = (await res.json()) as StorefrontState;
      setStorefront({
        intent: data.intent ?? null,
        products: data.products ?? [],
        denied: Boolean((data as { denied?: boolean }).denied),
      });
    } finally {
      setStoreLoading(false);
    }
  }, [merchantId]);

  const submit = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || extracting) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", text: message }]);
      setCaptured(null);
      setExtracting(true);
      try {
        const res = await fetch("/api/handoff/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const data = (await res.json()) as { intent: SCPIntentInput; mode: "live" | "demo" };
        setCaptured(data.intent);
        setMode(data.mode);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            text: `Here's what I'll carry over: ${data.intent.summary}. Continue to Acme and the store will already know why you're there.`,
          },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", text: "Something went wrong extracting intent. Try again." },
        ]);
      } finally {
        setExtracting(false);
      }
    },
    [extracting],
  );

  const handOff = useCallback(async () => {
    if (!captured || !merchantId || handingOff) return;
    setHandingOff(true);
    try {
      await fetch("/api/scp/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, shopperId: SHOPPER_ID, intent: captured }),
      });
      await loadStorefront();
    } finally {
      setHandingOff(false);
    }
  }, [captured, merchantId, handingOff, loadStorefront]);

  const toggleSharing = useCallback(
    async (next: boolean) => {
      if (!merchantId) return;
      setTogglingSharing(true);
      setIntentSharing(next);
      try {
        await fetch("/api/scopes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ merchantId, dataType: "intent", exposed: next }),
        });
        // If we've already handed off, re-read so the storefront flips live.
        if (storefront) await loadStorefront();
      } finally {
        setTogglingSharing(false);
      }
    },
    [merchantId, storefront, loadStorefront],
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
      {/* Assistant panel */}
      <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card lg:h-[620px]">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Shopping assistant</p>
              <p className="text-[11px] text-muted-foreground">
                Signed in as {SHOPPER_NAME}
              </p>
            </div>
          </div>
          {mode && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                mode === "live"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground ring-border",
              )}
            >
              {mode === "live" ? "Claude · live" : "Demo mode"}
            </span>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Type anything a shopper might say. The assistant pulls out structured,
                transferable intent — the &ldquo;uplink&rdquo; from clicks to natural language.
              </p>
              <div className="space-y-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="block w-full rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}

          {extracting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting intent…
            </div>
          )}

          {captured && !extracting && (
            <IntentCard intent={captured} onHandOff={handOff} handingOff={handingOff} />
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-2 border-t border-border/60 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell the assistant what you're shopping for…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          <Button type="submit" size="sm" disabled={extracting || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Storefront panel */}
      <div className="h-[560px] lg:h-[620px]">
        <StorefrontPanel
          loaded={storefront !== null}
          loading={storeLoading}
          intent={storefront?.intent ?? null}
          products={storefront?.products ?? []}
          denied={storefront?.denied ?? false}
          intentSharing={intentSharing}
          onToggleSharing={toggleSharing}
          togglingSharing={togglingSharing}
        />
      </div>
    </div>
  );
}

function IntentCard({
  intent,
  onHandOff,
  handingOff,
}: {
  intent: SCPIntentInput;
  onHandOff: () => void;
  handingOff: boolean;
}) {
  return (
    <div className="animate-in-up rounded-xl border border-primary/20 bg-accent/50 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
        Intent captured
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        <Field label="Category" value={intent.category} />
        <Field label="Occasion" value={intent.occasion ?? "—"} />
        <Field label="Timeframe" value={intent.timeframe ?? "—"} />
        <Field label="Attributes" value={`${intent.attributes.length} captured`} />
      </dl>
      {intent.attributes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {intent.attributes.map((a) => (
            <span
              key={`${a.name}-${a.value}`}
              className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-inset ring-border"
            >
              {a.name}: {a.value}
            </span>
          ))}
        </div>
      )}
      <Button size="sm" className="mt-3 w-full" onClick={onHandOff} disabled={handingOff}>
        {handingOff ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Carrying intent to Acme…
          </>
        ) : (
          <>
            Continue on Acme
            <ArrowRight className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate font-medium text-foreground">{value}</dd>
    </div>
  );
}
