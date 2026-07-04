"use client";

import { useRouter } from "next/navigation";
import { ConnectStep } from "@/components/onboarding/ConnectStep";

interface Props {
  merchantId: string;
}

export function ConnectPageClient({ merchantId }: Props) {
  const router = useRouter();

  return (
    <div className="flex justify-center py-8">
      <ConnectStep
        onComplete={(newMerchantId) => router.push(`/dashboard?merchantId=${newMerchantId}`)}
        onBack={() => router.push(`/dashboard?merchantId=${merchantId}`)}
        showDemoHint={false}
      />
    </div>
  );
}
