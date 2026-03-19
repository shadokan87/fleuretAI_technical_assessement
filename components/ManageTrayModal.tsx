"use client";

import { useEffect, useState } from "react";
import { useTray } from "@/hooks/useTray";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function ManageTrayModal() {
  const {
    trays,
    manageModalOpen,
    closeManageModal,
    createTray,
    deleteTray,
    renameTray,
    removeFromTray,
    activeTrayId,
    setActiveTrayId,
    autoActivateOnAdd,
    setAutoActivateOnAdd,
    manageModalDefaultValue,
  } = useTray();

  const [newTrayName, setNewTrayName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [expandedTrayId, setExpandedTrayId] = useState<string | null>(null);

  useEffect(() => {
    if (manageModalOpen && manageModalDefaultValue) {
      setNewTrayName(manageModalDefaultValue);
    }
  }, [manageModalOpen, manageModalDefaultValue]);

  const handleCreate = () => {
    const name = newTrayName.trim();
    if (!name) return;
    createTray(name);
    setNewTrayName("");
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const confirmRename = () => {
    if (editingId && editingName.trim()) {
      renameTray(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Dialog open={manageModalOpen} onOpenChange={(open) => !open && closeManageModal()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Trays</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="New tray name…"
            value={newTrayName}
            onChange={(e) => setNewTrayName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button size="sm" onClick={handleCreate} disabled={!newTrayName.trim()}>
            <Plus className="size-4 mr-1" />
            Create
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="auto-activate"
            checked={autoActivateOnAdd}
            onCheckedChange={(checked) => setAutoActivateOnAdd(checked === true)}
          />
          <label htmlFor="auto-activate" className="text-sm text-muted-foreground cursor-pointer select-none">
            Set last used tray as active
          </label>
        </div>

        <Separator />

        {trays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No trays yet. Create one above.
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {trays.map((tray) => (
              <div key={tray.id} className="rounded-md border">
                <div className="flex items-center gap-2 px-3 py-2">
                  {editingId === tray.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                        className="h-7 text-sm flex-1"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="size-7" onClick={confirmRename}>
                        <Check className="size-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7" onClick={cancelRename}>
                        <X className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flex-1 text-left text-sm font-medium truncate hover:underline"
                        onClick={() => setExpandedTrayId(expandedTrayId === tray.id ? null : tray.id)}
                      >
                        {tray.name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({tray.vulnerabilityIds.length})
                        </span>
                      </button>
                      {activeTrayId === tray.id ? (
                        <span className="text-xs text-primary font-medium">Active</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => setActiveTrayId(tray.id)}
                        >
                          Set active
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => startRename(tray.id, tray.name)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => deleteTray(tray.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>

                {expandedTrayId === tray.id && tray.vulnerabilityIds.length > 0 && (
                  <div className="border-t px-3 py-2 flex flex-col gap-1">
                    {tray.vulnerabilityIds.map((vulnId) => (
                      <div key={vulnId} className="flex items-center justify-between text-xs">
                        <span className="font-mono">{vulnId}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-5 text-destructive hover:text-destructive"
                          onClick={() => { removeFromTray(tray.id, vulnId); toast(`Removed ${vulnId} from ${tray.name}`); }}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
