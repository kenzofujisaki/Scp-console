import { eq, count, and, gte } from "drizzle-orm";
import { FlaskConical, ScrollText, Shield, Zap } from "lucide-react";
import { getDb } from "@/lib/db";
import { auditEvents, merchants, scopeSettings } from "@/lib/db/schema";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  searchParams: { merchantId?: string };
}

export default function DashboardOverview({ searchParams }: Props) {
  const merchantId = searchParams.merchantId ?? "";
  const db = getDb();

  const merchant = db.select().from(merchants).where(eq(merchants.id, merchantId)).get();
  const scopes = db
    .select()
    .from(scopeSettings)
    .where(eq(scopeSettings.merchantId, merchantId))
    .all();

  const totalEvents =
    db.select({ total: count() }).from(auditEvents).where(eq(auditEvents.merchantId, merchantId)).all().at(0)?.total ?? 0;

  const oneDayAgoDate = new Date(Date.now() - 86400 * 1000);
  const eventsToday =
    db
      .select({ total: count() })
      .from(auditEvents)
      .where(and(eq(auditEvents.merchantId, merchantId), gte(auditEvents.occurredAt, oneDayAgoDate)))
      .all()
      .at(0)?.total ?? 0;

  const exposedCount = scopes.filter((s) => s.exposed).length;

  return (
    <div className="animate-in-up space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {merchant?.name ?? "Unknown Merchant"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Shopper Context Protocol endpoint governance dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Audit Events"
          value={totalEvents}
          icon={ScrollText}
          description="All requests logged"
          accentColor="indigo"
        />
        <StatCard
          label="Last 24 Hours"
          value={eventsToday}
          icon={Zap}
          description="Context requests today"
          accentColor="emerald"
        />
        <StatCard
          label="Scopes Exposed"
          value={`${exposedCount} / ${scopes.length}`}
          icon={Shield}
          description="Active scope policy"
          accentColor={exposedCount === scopes.length ? "amber" : "slate"}
        />
        <StatCard
          label="Test Shoppers"
          value={5}
          icon={FlaskConical}
          description="Acme Outdoor Co. — fake data"
          accentColor="slate"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Active Scope Policy</CardTitle>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums">
              {exposedCount} of {scopes.length} live
            </span>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {scopes.map((scope) => (
                <li
                  key={scope.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <code className="font-mono text-sm text-foreground/80">{scope.dataType}</code>
                  <PostureChip exposed={scope.exposed} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3.5">
              {QUICK_START.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <strong className="font-semibold text-foreground">{step.title}</strong> —{" "}
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Posture chip. Deliberately NOT red-for-blocked: withholding data is the
 * protective, correct governance state — it should read as calm, not as an
 * error. Emerald marks "live to AI"; a neutral slate marks "withheld".
 */
function PostureChip({ exposed }: { exposed: boolean }) {
  if (exposed) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Exposed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Withheld
    </span>
  );
}

const QUICK_START: { title: string; body: string }[] = [
  {
    title: "Browse context",
    body: "See exactly what an AI assistant receives when it queries a shopper.",
  },
  {
    title: "Test a request",
    body: "Pick a fake shopper, simulate a request, and inspect the live response.",
  },
  {
    title: "Flip a scope",
    body: "Toggle offers on, re-run, and watch personalised promotions appear in the response.",
  },
  {
    title: "Export the log",
    body: "Every change and request is recorded. Download the audit CSV for sign-off.",
  },
];
