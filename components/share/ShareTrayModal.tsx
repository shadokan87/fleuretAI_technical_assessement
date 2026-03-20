"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { shareAdapters } from "./registry";
import type { SharePayload } from "./types";

interface ShareTrayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: SharePayload | null;
}

export default function ShareTrayModal({
  open,
  onOpenChange,
  payload,
}: ShareTrayModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = shareAdapters.find((a) => a.id === selectedId);

  const handleClose = () => {
    setSelectedId(null);
    onOpenChange(false);
  };

  const handleBack = () => setSelectedId(null);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
        else onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selected && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={handleBack}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            {selected ? `Share via ${selected.label}` : "Share tray"}
          </DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="grid grid-cols-2 gap-3 py-2">
            {shareAdapters.map((adapter) => {
              const icon = React.isValidElement(adapter.icon)
                ? adapter.icon
                : (() => { const Icon = adapter.icon as React.ComponentType<{ className?: string }>; return <Icon className={`size-8 ${adapter.color}`} />; })();
              return (
                <button
                  key={adapter.id}
                  onClick={() => setSelectedId(adapter.id)}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors cursor-pointer"
                >
                  {icon}
                  <span className="text-sm font-medium">{adapter.label}</span>
                </button>
              );
            })}
          </div>
        ) : payload ? (
          <selected.Component payload={payload} onClose={handleClose} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
