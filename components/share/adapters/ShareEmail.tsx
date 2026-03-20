"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShareAdapter, ShareAdapterProps } from "../types";
import DescriptionPreview from "../DescriptionPreview";

function ShareEmailDialog({ payload, onClose }: ShareAdapterProps) {
  const { trayName, vulnerabilities, baseUrl } = payload;

  const links = vulnerabilities
    .map((v) => `• ${v.title} (${v.severity})\n  ${baseUrl}/vulnerability?id=${v.id}`)
    .join("\n\n");

  const subject = encodeURIComponent(`Shared tray: ${trayName}`);
  const body = encodeURIComponent(
    `Here are the vulnerabilities from tray "${trayName}":\n\n${links}`
  );

  const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This will open your default email client with links to all{" "}
        <strong>{vulnerabilities.length}</strong> vulnerabilities in{" "}
        <strong>{trayName}</strong>.
      </p>

      <DescriptionPreview value={decodeURIComponent(body)} copy={true} />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button asChild>
          <a href={mailtoUrl} onClick={onClose}>
            Open email client
          </a>
        </Button>
      </div>
    </div>
  );
}

export const emailAdapter: ShareAdapter = {
  id: "email",
  label: "Email",
  icon: Mail,
  color: "text-blue-500",
  Component: ShareEmailDialog,
};
