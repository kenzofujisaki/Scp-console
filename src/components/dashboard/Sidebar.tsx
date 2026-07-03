"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FlaskConical, LayoutDashboard, ScrollText, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/context", label: "Context Browser", icon: Search, exact: false },
  { href: "/dashboard/test", label: "Request Tester", icon: FlaskConical, exact: false },
  { href: "/dashboard/scopes", label: "Scope Controls", icon: Shield, exact: false },
  { href: "/dashboard/audit", label: "Audit Log", icon: ScrollText, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const merchantId = searchParams.get("merchantId") ?? "";

  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
          S
        </div>
        <span className="font-semibold text-slate-800">SCP Console</span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          const fullHref = merchantId ? `${href}?merchantId=${merchantId}` : href;
          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/onboarding"
          className="block text-xs text-slate-400 hover:text-slate-600"
        >
          + Connect a server
        </Link>
        <p className="mt-1 text-xs text-slate-400">Self-hosted · No external services</p>
      </div>
    </aside>
  );
}
