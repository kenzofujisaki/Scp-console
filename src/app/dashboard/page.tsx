import { eq, count, and, gte } from "drizzle-orm";
import { FlaskConical, ScrollText, Shield, Zap } from "lucide-react";
import { getDb } from "@/lib/db";
import { auditEvents, merchants, scopeSettings } from "@/lib/db/schema";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          {merchant?.name ?? "Unknown Merchant"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Shopper Context Protocol endpoint governance dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Audit Events"
          value={totalEvents}
          icon={ScrollText}
          description="All requests logged"
          accentColor="blue"
        />
        <StatCard
          label="Last 24 Hours"
          value={eventsToday}
          icon={Zap}
          description="Context requests today"
          accentColor="green"
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
          <CardHeader>
            <CardTitle className="text-base">Active Scope Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scopes.map((scope) => (
                <li key={scope.id} className="flex items-center justify-between text-sm">
                  <code className="font-mono text-slate-700">{scope.dataType}</code>
                  <Badge variant={scope.exposed ? "success" : "destructive"}>
                    {scope.exposed ? "Exposed" : "Blocked"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              <strong>1. Browse context</strong> — See exactly what an AI assistant receives when
              it queries a shopper.
            </p>
            <p>
              <strong>2. Test a request</strong> — Pick a fake shopper, simulate a request, and
              inspect the live response.
            </p>
            <p>
              <strong>3. Flip a scope</strong> — Toggle order_history off, re-run, and watch the
              data disappear from the response.
            </p>
            <p>
              <strong>4. Export the log</strong> — Every change and request is recorded. Download
              the audit CSV for sign-off.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
