"use client";

import { Loader2, PackageOpen, Search, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SCPIntent, SCPProduct } from "@/lib/scp/types";

interface Props {
  loaded: boolean;
  loading: boolean;
  intent: SCPIntent | null;
  products: SCPProduct[];
  denied: boolean;
  intentSharing: boolean;
  onToggleSharing: (next: boolean) => void;
  togglingSharing: boolean;
}

const GENERIC_CATEGORIES = ["Boots", "Jackets", "Backpacks", "Camping", "Trail", "Apparel"];

/**
 * The Acme storefront the shopper lands on after the assistant hands off. With
 * intent (warm), it greets them by their goal and pre-filters the catalog; with
 * the intent channel governed off (cold), it's a generic homepage where the
 * shopper has to start over. The sharing toggle flips the two live.
 */
export function StorefrontPanel({
  loaded,
  loading,
  intent,
  products,
  denied,
  intentSharing,
  onToggleSharing,
  togglingSharing,
}: Props) {
  const warm = loaded && !denied && intent !== null;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </span>
        <div className="ml-2 flex-1 truncate rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          acmeoutdoor.com
        </div>
      </div>

      {/* Governance control — the demo's aha lever */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground">Intent sharing (SCP)</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {intentSharing
              ? "The brand receives carried intent"
              : "Governed off — the storefront gets nothing"}
          </p>
        </div>
        <Switch
          checked={intentSharing}
          onCheckedChange={onToggleSharing}
          disabled={togglingSharing}
          aria-label="Toggle intent sharing"
          className="data-[state=checked]:bg-emerald-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {!loaded ? (
          <EmptyState />
        ) : loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading storefront…
          </div>
        ) : warm ? (
          <WarmLanding intent={intent} products={products} />
        ) : (
          <ColdLanding />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">
        Capture intent in the assistant, then hand off to see this storefront react.
      </p>
    </div>
  );
}

function WarmLanding({ intent, products }: { intent: SCPIntent; products: SCPProduct[] }) {
  const forWhat = intent.occasion ?? intent.category;
  return (
    <div className="animate-in-up space-y-4 p-4">
      {/* Personalised banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          Picked up where you left off
        </div>
        <p className="mt-1.5 text-base font-semibold text-foreground">
          Ready for {forWhat}
          {intent.timeframe ? ` · ${intent.timeframe}` : ""}
        </p>
        <p className="mt-0.5 text-sm text-emerald-800/80 dark:text-emerald-200/70">{intent.summary}</p>
        {intent.attributes.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {intent.attributes.map((a) => (
              <span
                key={`${a.name}-${a.value}`}
                className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-200"
              >
                {a.value}
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {products.length} matches, no re-searching required
      </p>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function ColdLanding() {
  return (
    <div className="animate-in-up space-y-5 p-4">
      <div className="rounded-xl border border-border/70 bg-muted/30 p-5 text-center">
        <p className="text-base font-semibold text-foreground">Welcome to Acme Outdoor Co.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Gear for every trail, ranch, and rodeo.
        </p>
        <div className="mx-auto mt-3 flex max-w-xs items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Search the whole catalog…
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Popular categories</p>
        <div className="grid grid-cols-3 gap-2">
          {GENERIC_CATEGORIES.map((c) => (
            <div
              key={c}
              className="rounded-lg border border-border/70 bg-card px-3 py-4 text-center text-sm text-muted-foreground"
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
        No shopper context — the customer starts from scratch.
      </p>
    </div>
  );
}

function ProductCard({ product }: { product: SCPProduct }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card transition-shadow hover:shadow-card">
      <div
        className={cn(
          "flex h-20 items-center justify-center bg-gradient-to-br text-lg font-semibold text-white/90",
          "from-primary/70 to-emerald-500/60",
        )}
      >
        {product.category}
      </div>
      <div className="p-2.5">
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
          {product.blurb}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
