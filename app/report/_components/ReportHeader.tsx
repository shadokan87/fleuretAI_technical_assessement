"use client";

import { useState } from "react";
import { ExecutiveSummary, Scope } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Flex from "@/components/Flex";

interface ReportHeaderProps {
  summary?: ExecutiveSummary;
  scopes?: Scope[];
  totalVulnerabilities?: number;
  isLoading: boolean;
  reportId: string;
  selectedCount?: number;
  onAddSelectedToTray?: () => void;
}

export default function ReportHeader({
  summary,
  scopes,
  totalVulnerabilities,
  isLoading,
  reportId,
  selectedCount = 0,
  onAddSelectedToTray,
}: ReportHeaderProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/report?reportId=${encodeURIComponent(reportId)}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Flex gap={3} className="items-center flex-wrap py-3">
        {[80, 60, 48, 48, 64, 48].map((w, i) => (
          <div key={i} className={`h-5 w-${w === 80 ? '[80px]' : w === 60 ? '[60px]' : w === 64 ? '[64px]' : '[48px]'} animate-pulse rounded-full bg-muted`} />
        ))}
      </Flex>
    );
  }

  const score = summary ? Math.round(summary.globalSecurityScore / 10) : 0;
  const scoreVariant =
    score >= 8 ? "secondary" : score >= 5 ? "default" : "destructive";

  const vulnCounts = summary?.vulnerabilityCount;
  const scanDate = summary?.scanDate
    ? new Date(summary.scanDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Flex gap={3} className="items-center flex-wrap py-3">
      {/* Scopes */}
      <Flex gap={1} className="items-center">
        <span className="text-xs text-muted-foreground mr-1">Scopes</span>
        {scopes?.map((scope) => (
          <Badge key={scope.id} variant="secondary" className="font-mono text-xs">
            {scope.domain ?? scope.ipAddress}
          </Badge>
        ))}
      </Flex>

      <Separator orientation="vertical" className="h-4" />

      {/* Vulnerability counts */}
      <Flex gap={1} className="items-center">
        <span className="text-xs text-muted-foreground mr-1">Vulns</span>
        {vulnCounts && vulnCounts.critical > 0 && (
          <Badge variant="destructive" className="text-xs">{vulnCounts.critical} Critical</Badge>
        )}
        {vulnCounts && vulnCounts.high > 0 && (
          <Badge variant="destructive" className="text-xs opacity-80">{vulnCounts.high} High</Badge>
        )}
        {vulnCounts && vulnCounts.medium > 0 && (
          <Badge variant="default" className="text-xs">{vulnCounts.medium} Medium</Badge>
        )}
        {vulnCounts && vulnCounts.low > 0 && (
          <Badge variant="secondary" className="text-xs">{vulnCounts.low} Low</Badge>
        )}
        {vulnCounts && vulnCounts.info > 0 && (
          <Badge variant="outline" className="text-xs">{vulnCounts.info} Info</Badge>
        )}
      </Flex>

      <Separator orientation="vertical" className="h-4" />

      {/* Score */}
      <Flex gap={1} className="items-center">
        <span className="text-xs text-muted-foreground mr-1">Score</span>
        <Badge variant={scoreVariant} className="text-xs tabular-nums">
          {score}/10
        </Badge>
      </Flex>

      {/* Scan date */}
      {scanDate && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <Flex gap={1} className="items-center">
            <span className="text-xs text-muted-foreground mr-1">Scanned</span>
            <Badge variant="outline" className="text-xs">{scanDate}</Badge>
          </Flex>
        </>
      )}

      {/* Actions */}
      <Flex gap={2} className="ml-auto items-center">
        {selectedCount > 0 && (
          <Button variant="outline" size="sm" onClick={onAddSelectedToTray}>
            Add {selectedCount} to Tray
          </Button>
        )}
        <Button variant="default" size="sm" disabled={exporting} onClick={handleExport}>
          {exporting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="size-4 mr-2" />
          )}
          Download Report
        </Button>
      </Flex>
    </Flex>
  );
}
