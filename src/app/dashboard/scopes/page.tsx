import { ScopeControls } from "@/components/scopes/ScopeControls";

export const metadata = {
  title: "Scope Controls — SCP Console",
};

export default function ScopesPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Scope Controls</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Choose which data types your SCP endpoint exposes to AI assistants. Every change is
          logged.
        </p>
      </div>
      <ScopeControls />
    </div>
  );
}
