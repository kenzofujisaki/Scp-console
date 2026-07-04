import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { merchants } from "@/lib/db/schema";
import { RequestTester } from "@/components/testing/RequestTester";

export const metadata = {
  title: "Request Tester — SCP Console",
};

interface Props {
  searchParams: { merchantId?: string };
}

export default function TestPage({ searchParams }: Props) {
  const merchantId = searchParams.merchantId;
  if (!merchantId) redirect("/onboarding");

  const db = getDb();
  const merchant = db.select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Request Tester</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Simulate an AI assistant request. See the exact response, then check the Audit Log.
        </p>
      </div>
      <RequestTester endpointUrl={merchant.scpEndpointUrl} />
    </div>
  );
}
