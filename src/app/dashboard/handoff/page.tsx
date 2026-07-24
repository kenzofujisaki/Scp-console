import { HandoffDemo } from "@/components/handoff/HandoffDemo";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Intent Handoff — SCP Console",
};

export default function HandoffPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Intent Handoff</h2>
        <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
          The other half of SCP: a shopper forms intent in an assistant, and that intent travels
          back to the brand so the storefront greets them already knowing why they&apos;re there.
          Toggle intent sharing to watch the same landing go warm or cold — every request is logged.
        </p>
      </div>
      <HandoffDemo />
    </div>
  );
}
