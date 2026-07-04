"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { SidebarContent } from "./nav";

/**
 * Mobile navigation drawer. Built on Radix Dialog, which provides an accessible
 * modal for free: focus trap, ESC-to-close, aria-modal, scroll lock, and focus
 * return to the trigger. Only rendered below the lg breakpoint.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px] lg:hidden" />
        <Dialog.Content
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-elevated focus:outline-none lg:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Move between the Console&apos;s governance pages.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute right-2 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </Dialog.Close>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
