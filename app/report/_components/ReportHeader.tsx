"use client";

import { ExecutiveSummary, Scope } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import Flex from "@/components/Flex";

interface ReportHeaderProps {
  summary?: ExecutiveSummary;
  scopes?: Scope[];
  totalVulnerabilities?: number;
  isLoading: boolean;
}

export default function ReportHeader({
  summary,
  scopes,
  totalVulnerabilities,
  isLoading,
}: ReportHeaderProps) {
  if (isLoading) {
    return (
      <Flex gap={6} className="items-center">
        <Flex gap={2} className="items-center">
          <span className="text-sm font-medium">Scopes:</span>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          ))}
        </Flex>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </Flex>
    );
  }

  const score = summary
    ? Math.round(summary.globalSecurityScore / 10)
    : 0;

  return (
    <Flex gap={6} className="items-center flex-wrap">
      <Flex gap={2} className="items-center">
        <span className="text-sm font-medium">Scopes:</span>
        {scopes?.map((scope) => (
          <Badge key={scope.id} variant="secondary">
            {scope.domain ?? scope.ipAddress}
          </Badge>
        ))}
      </Flex>
      <span className="text-sm">
        Total vulnerabilities {totalVulnerabilities ?? 0}
      </span>
      <span className="text-sm">Global score {score}/10</span>
    </Flex>
  );
}
