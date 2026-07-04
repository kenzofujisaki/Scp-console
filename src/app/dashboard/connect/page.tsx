import type { Metadata } from "next";
import { ConnectPageClient } from "@/components/connect/ConnectPageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connect Server — SCP Console",
};

interface Props {
  searchParams: { merchantId?: string };
}

export default function ConnectPage({ searchParams }: Props) {
  return <ConnectPageClient merchantId={searchParams.merchantId ?? ""} />;
}
