import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Shared nautical-styled modal frame so all game modals look consistent.
export default function GameModalShell({ open, onOpenChange, title, subtitle, children, footer }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-wood border-line text-ink max-w-lg p-0 gap-0">
        <DialogHeader className="panel-header px-5 py-4">
          <DialogTitle className="font-display text-brass-bright text-lg tracking-wide">{title}</DialogTitle>
          {subtitle && <p className="font-body-game text-sm text-ink-dim">{subtitle}</p>}
          <div className="brass-rule mt-2" />
        </DialogHeader>
        <div className="px-5 py-4 space-y-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line flex justify-end gap-2">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}