import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata = {
  title: "Get Started — SCP Console",
};

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12">
      {/* Ambient backdrop — recessive, theme-aware */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_70%_-10%,hsl(var(--primary)/0.08),transparent),radial-gradient(50rem_30rem_at_0%_110%,hsl(152_60%_45%/0.06),transparent)]"
      />
      <OnboardingWizard />
    </main>
  );
}
