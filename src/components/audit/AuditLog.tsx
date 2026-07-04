"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime, formatAbsoluteTime, parseJsonSafe, toDate } from "@/lib/utils";
import type { AuditEvent } from "@/lib/db/schema";

/** Status colors are reserved for genuine request outcomes — success / denied / error. */
const STATUS_STYLE: Record<string, string> = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  denied: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
  error: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400",
};

const STATUS_DOT: Record<string, string> = {
  success: "bg-emerald-500",
  denied: "bg-amber-500",
  error: "bg-rose-500",
};

const PAGE_SIZE = 50;

export function AuditLog() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const loadEvents = useCallback(
    async (newOffset: number) => {
      if (!merchantId) return;
      setLoading(true);
      try {
        const url = `/api/audit?merchantId=${merchantId}&limit=${PAGE_SIZE}&offset=${newOffset}`;
        const res = await fetch(url);
        const data = (await res.json()) as { events: AuditEvent[]; limit: number; offset: number };
        if (newOffset === 0) {
          setEvents(data.events);
        } else {
          setEvents((prev) => [...prev, ...data.events]);
        }
        setHasMore(data.events.length === PAGE_SIZE);
        setOffset(newOffset + data.events.length);
      } finally {
        setLoading(false);
      }
    },
    [merchantId],
  );

  useEffect(() => {
    loadEvents(0);
  }, [loadEvents]);

  const exportCsv = () => {
    window.open(`/api/audit/export?merchantId=${merchantId}`, "_blank");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{events.length}</span> event
          {events.length !== 1 ? "s" : ""} — metadata only, no shopper PII
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadEvents(0)}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Time</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Actor</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Requested</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Returned</th>
                <th className="px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {events.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No events yet. Run a context request to see it here.
                  </td>
                </tr>
              )}
              {events.map((event) => {
                const ts = toDate(event.occurredAt);
                const requested = parseJsonSafe<string[]>(event.requestedScopes as string, []);
                const returned = parseJsonSafe<string[]>(event.dataTypesReturned as string, []);

                return (
                  <tr key={event.id} className="transition-colors hover:bg-muted/40">
                    <td
                      className="whitespace-nowrap px-4 py-3 text-muted-foreground"
                      title={formatAbsoluteTime(ts)}
                    >
                      {formatRelativeTime(ts)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      {event.actor}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {requested.map((s) => (
                          <code
                            key={s}
                            className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                          >
                            {s}
                          </code>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {returned.map((s) => (
                          <code
                            key={s}
                            className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            {s}
                          </code>
                        ))}
                        {returned.length === 0 && (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                          STATUS_STYLE[event.status] ??
                            "bg-muted text-muted-foreground ring-border",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            STATUS_DOT[event.status] ?? "bg-slate-400",
                          )}
                        />
                        {event.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground tabular-nums">
                      {event.latencyMs != null ? `${event.latencyMs}ms` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => loadEvents(offset)}
          disabled={loading}
        >
          {loading ? "Loading…" : "Load more"}
        </Button>
      )}
    </div>
  );
}
