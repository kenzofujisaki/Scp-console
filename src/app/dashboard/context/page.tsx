import { ContextBrowser } from "@/components/context/ContextBrowser";

export const metadata = {
  title: "Context Browser — SCP Console",
};

export default function ContextPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Context Browser</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          See exactly what an AI assistant receives when it queries your SCP endpoint.
        </p>
      </div>
      <ContextBrowser />
    </div>
  );
}
