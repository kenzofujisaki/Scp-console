import { AuditLog } from "@/components/audit/AuditLog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Log — SCP Console",
};

export default function AuditPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Audit Log</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every context request and scope change, with full provenance. Metadata only — no shopper
          PII is stored.
        </p>
      </div>
      <AuditLog />
    </div>
  );
}
