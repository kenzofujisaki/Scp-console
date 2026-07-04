import { ContextBrowser } from "@/components/context/ContextBrowser";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Context Browser — SCP Console",
};

export default function ContextPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Context Browser</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          See exactly what an AI assistant receives when it queries your SCP endpoint.
        </p>
      </div>
      <ContextBrowser />
    </div>
  );
}
