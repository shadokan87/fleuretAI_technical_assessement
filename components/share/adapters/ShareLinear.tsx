"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { ShareAdapter, ShareAdapterProps } from "../types";
import DescriptionPreview from "../DescriptionPreview";

const LinearIcon = (
  <span className="block size-8">
    <img src="/logo-dark.png" alt="Linear" className="size-8 block dark:hidden" />
    <img src="/logo-light.png" alt="Linear" className="size-8 hidden dark:block" />
  </span>
);

function ShareLinearDialog({ payload, onClose }: ShareAdapterProps) {
  const { trayName, vulnerabilities, baseUrl } = payload;
  const [teamId, setTeamId] = useState("");
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopyDesc = async () => {
    await navigator.clipboard.writeText(description);
    setCopiedDesc(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const description = vulnerabilities
    .map(
      (v) =>
        `- [${v.title}](${baseUrl}/vulnerability?id=${v.id}) — **${v.severity}** (${v.asset})`
    )
    .join("\n");

  const title = `[Pentest] ${trayName} — ${vulnerabilities.length} vulnerabilities`;

  const handleCreate = () => {
    const params = new URLSearchParams({
      title,
      description,
    });
    if (teamId.trim()) {
      params.set("teamId", teamId.trim());
    }
    window.open(
      `https://linear.app/new?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Create a Linear issue with all{" "}
        <strong>{vulnerabilities.length}</strong> vulnerabilities from{" "}
        <strong>{trayName}</strong>.
      </p>

      <div className="space-y-2">
        <label className="text-xs font-medium">Title</label>
        <Input value={title} readOnly className="text-xs" />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Team ID (optional)</label>
        <Input
          placeholder="e.g. SEC"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Description preview</label>
        <DescriptionPreview value={description} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleCreate}>Open in Linear</Button>
      </div>
    </div>
  );
}

export const linearAdapter: ShareAdapter = {
  id: "linear",
  label: "Linear",
  icon: LinearIcon,
  color: "",
  Component: ShareLinearDialog,
};
