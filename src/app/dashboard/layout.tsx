import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { getDb } from "@/lib/db";
import { merchants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  children: React.ReactNode;
  searchParams: { merchantId?: string };
}

export default function DashboardLayout({ children, searchParams }: Props) {
  const merchantId = searchParams.merchantId;
  if (!merchantId) redirect("/onboarding");

  const db = getDb();
  const merchant = db.select().from(merchants).where(eq(merchants.id, merchantId)).get();
  if (!merchant) redirect("/onboarding");

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          merchantName={merchant.name}
          endpointUrl={merchant.scpEndpointUrl}
          isReference={merchant.isReference}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
