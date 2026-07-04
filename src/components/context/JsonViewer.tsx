"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopperDataView, isShopperShaped } from "./ShopperDataView";

interface Props {
  data: unknown;
  placeholder?: string;
}

function highlight(json: string): string {
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        return /:$/.test(match)
          ? `<span style="color:#7dd3fc">${match}</span>` // key
          : `<span style="color:#86efac">${match}</span>`; // string value
      }
      if (/true|false/.test(match)) return `<span style="color:#fdba74">${match}</span>`;
      if (/null/.test(match)) return `<span style="color:#94a3b8">${match}</span>`;
      return `<span style="color:#c084fc">${match}</span>`; // number
    },
  );
}

export function JsonViewer({ data, placeholder = "No data" }: Props) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"table" | "raw">("table");

  if (data === null || data === undefined) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 text-center text-sm text-muted-foreground">
        {placeholder}
      </div>
    );
  }

  const json = JSON.stringify(data, null, 2);
  const canFormat = isShopperShaped(data);
  const activeView = canFormat ? view : "raw";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked — no-op */
    }
  };

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-[hsl(224_40%_8%)] shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="ml-1 font-mono text-xs text-slate-400">
            response · application/json
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canFormat && (
            <div
              role="tablist"
              aria-label="Response view"
              className="flex items-center rounded-md bg-white/5 p-0.5 ring-1 ring-inset ring-white/10"
            >
              {(["table", "raw"] as const).map((v) => (
                <button
                  key={v}
                  role="tab"
                  aria-selected={activeView === v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-medium capitalize transition-colors",
                    activeView === v
                      ? "bg-white/15 text-white"
                      : "text-slate-400 hover:text-slate-200",
                  )}
                >
                  {v === "table" ? "Table" : "Raw"}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>
      {activeView === "table" && canFormat ? (
        <div className="max-h-[560px] flex-1 overflow-auto">
          <ShopperDataView data={data} />
        </div>
      ) : (
        <pre
          className="max-h-[560px] flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed text-slate-100"
          // highlight() only inserts controlled span tags with inline styles — no user content
          dangerouslySetInnerHTML={{ __html: highlight(json) }}
        />
      )}
    </div>
  );
}
