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

  const goToDashboard = (merchantId: string) => {
    router.push(`/dashboard?merchantId=${merchantId}`);
  };

  if (step === "demo") {
    return <DemoStep onComplete={goToDashboard} />;
  }

  if (step === "connect") {
    return (
      <ConnectStep onComplete={goToDashboard} onBack={() => setStep("welcome")} />
    );
  }

  return (
    <WelcomeStep
      onSelectDemo={() => setStep("demo")}
      onSelectConnect={() => setStep("connect")}
    />
  );
}
