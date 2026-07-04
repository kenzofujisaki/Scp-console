"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { MobileNav } from "@/components/dashboard/MobileNav";

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
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-card/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <MobileNav />
        <span className="hidden text-muted-foreground sm:inline">Console</span>
        <span className="hidden text-muted-foreground/40 sm:inline">/</span>
        <h1 className="truncate font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
        {merchantName && (
          <span className="hidden font-medium text-foreground md:inline">{merchantName}</span>
        )}
        {isReference && (
          <span className="hidden rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground ring-1 ring-inset ring-primary/15 sm:inline">
            Reference
          </span>
        )}
        {endpointUrl && (
          <span className="hidden max-w-[240px] truncate rounded-md border border-border bg-muted px-2 py-1 font-mono text-xs text-muted-foreground lg:block">
            {endpointUrl}
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 sm:px-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden text-xs font-medium text-emerald-700 dark:text-emerald-400 sm:inline">
            Online
          </span>
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}
