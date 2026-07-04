"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "./Header";

interface MerchantInfo {
  name: string;
  scpEndpointUrl: string;
  isReference: boolean;
}

export function DashboardHeader() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";
  const [merchant, setMerchant] = useState<MerchantInfo | null>(null);

  useEffect(() => {
    if (!merchantId) return;
    fetch(`/api/merchants/${merchantId}`)
      .then((r) => r.json())
      .then((data: { merchant?: MerchantInfo }) => {
        if (data.merchant) setMerchant(data.merchant);
      })
      .catch(() => {});
  }, [merchantId]);

  return (
    <Header
      merchantName={merchant?.name ?? ""}
      endpointUrl={merchant?.scpEndpointUrl ?? ""}
      isReference={merchant?.isReference ?? false}
    />
  );
}
