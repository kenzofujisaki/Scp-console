"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, formatAbsoluteTime, parseJsonSafe } from "@/lib/utils";
import type { AuditEvent } from "@/lib/db/schema";

const STATUS_BADGE: Record<string, "success" | "destructive" | "warning"> = {
  success: "success",
  denied: "warning",
  error: "destructive",
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
        <p className="text-sm text-slate-500">
          {events.length} event{events.length !== 1 ? "s" : ""} — metadata only, no shopper PII
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

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Time</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Actor</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Requested Scopes</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Returned</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No events yet. Run a context request to see it here.
                </td>
              </tr>
            )}
            {events.map((event) => {
              const ts =
                event.occurredAt instanceof Date
                  ? event.occurredAt
                  : new Date((event.occurredAt as number) * 1000);
              const requested = parseJsonSafe<string[]>(event.requestedScopes as string, []);
              const returned = parseJsonSafe<string[]>(event.dataTypesReturned as string, []);

              return (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500" title={formatAbsoluteTime(ts)}>
                    {formatRelativeTime(ts)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{event.actor}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {requested.map((s) => (
                        <code key={s} className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                          {s}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {returned.map((s) => (
                        <code key={s} className="rounded bg-green-50 px-1 py-0.5 text-xs text-green-700">
                          {s}
                        </code>
                      ))}
                      {returned.length === 0 && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[event.status] ?? "outline"}>{event.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {event.latencyMs != null ? `${event.latencyMs}ms` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
