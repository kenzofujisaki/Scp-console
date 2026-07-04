"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WelcomeStep } from "./WelcomeStep";
import { DemoStep } from "./DemoStep";
import { ConnectStep } from "./ConnectStep";

type Step = "welcome" | "demo" | "connect";

export function OnboardingWizard() {
  const [step, setStep] = useState<Step>("welcome");
  const router = useRouter();

  // Demo users land directly on the scope toggle with a one-time coach-mark —
  // the product's "aha" (flip a scope, control what AI sees) in the first seconds.
  const finishDemo = (merchantId: string) => {
    router.push(`/dashboard/scopes?merchantId=${merchantId}&coach=1`);
  };

  const finishConnect = (merchantId: string) => {
    router.push(`/dashboard?merchantId=${merchantId}`);
  };

  if (step === "demo") {
    return <DemoStep onComplete={finishDemo} />;
  }

  if (step === "connect") {
    return <ConnectStep onComplete={finishConnect} onBack={() => setStep("welcome")} />;
  }

  return (
    <WelcomeStep
      onSelectDemo={() => setStep("demo")}
      onSelectConnect={() => setStep("connect")}
    />
  );
}
