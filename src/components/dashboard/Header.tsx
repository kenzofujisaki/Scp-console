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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="font-medium text-slate-700">{merchantName}</span>
        {isReference && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            Reference
          </span>
        )}
        <span className="hidden max-w-[240px] truncate rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs md:block">
          {endpointUrl}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700">Online</span>
        </span>
      </div>
    </header>
  );
}
