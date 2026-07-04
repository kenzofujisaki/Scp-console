"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FlaskConical, LayoutDashboard, Plus, ScrollText, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/context", label: "Context Browser", icon: Search, exact: false },
  { href: "/dashboard/test", label: "Request Tester", icon: FlaskConical, exact: false },
  { href: "/dashboard/scopes", label: "Scope Controls", icon: Shield, exact: false },
  { href: "/dashboard/audit", label: "Audit Log", icon: ScrollText, exact: false },
];

/** The full sidebar body — brand, nav, footer. Shared by the desktop rail and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const merchantId = useSearchParams().get("merchantId") ?? "";

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">
          S
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold text-foreground">SCP Console</span>
          <span className="mt-0.5 text-[11px] text-muted-foreground">Control plane</span>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          Govern
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          const fullHref = merchantId ? `${href}?merchantId=${merchantId}` : href;
          return (
            <Link
              key={href}
              href={fullHref}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {isActive && (
                <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-foreground",
                )}
                strokeWidth={2}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href={`/dashboard/connect?merchantId=${merchantId}`}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
          Connect a server
        </Link>
        <p className="mt-2 px-3 text-[11px] leading-relaxed text-muted-foreground/70">
          Self-hosted · No external services
        </p>
      </div>
    </>
  );
}
