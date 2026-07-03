"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/context": "Context Browser",
  "/dashboard/test": "Request Tester",
  "/dashboard/scopes": "Scope Controls",
  "/dashboard/audit": "Audit Log",
  "/dashboard/connect": "Connect a Server",
};

interface Props {
  merchantName: string;
  endpointUrl: string;
  isReference: boolean;
}

export function Header({ merchantName, endpointUrl, isReference }: Props) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-card/70">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Console</span>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {merchantName && (
          <span className="hidden font-medium text-foreground sm:inline">{merchantName}</span>
        )}
        {isReference && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground ring-1 ring-inset ring-primary/15">
            Reference
          </span>
        )}
        {endpointUrl && (
          <span className="hidden max-w-[240px] truncate rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground md:block">
            {endpointUrl}
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 ring-1 ring-inset ring-emerald-600/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-700">Online</span>
        </span>
      </div>
    </header>
  );
}
