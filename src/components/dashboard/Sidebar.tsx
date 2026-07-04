"use client";

import { SidebarContent } from "./nav";

/** Persistent desktop rail. Hidden on mobile, where MobileNav provides a drawer. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <SidebarContent />
    </aside>
  );
}
