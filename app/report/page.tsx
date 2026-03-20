"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ReportSummaryResponse, Vulnerability } from "@/api/types";
import Flex from "@/components/Flex";
import ReportHeader from "./_components/ReportHeader";
import FilterBar from "./_components/FilterBar";
import VulnerabilityTable from "./_components/VulnerabilityTable";
import { Filters, initialFilters, getCategoryForTitle } from "./_types";
import { useReportsCache, CachedReport } from "@/hooks/useReportsCache";
import { useTray } from "@/hooks/useTray";
import { toast } from "sonner";

export default function ReportPage() {
  return (
    <Suspense>
      <ReportPageInner />
    </Suspense>
  );
}

function ReportPageInner() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId") ?? "report-001";
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { cache, addReport } = useReportsCache();
  const { trays, activeTrayId, addToTray, openManageModal } = useTray();

  const handleAddSelectedToTray = () => {
    if (selectedIds.size === 0) return;
    const activeTray = trays.find((t) => t.id === activeTrayId);
    if (!activeTray) {
      openManageModal();
      return;
    }
    selectedIds.forEach((id) => addToTray(activeTray.id, id));
    toast.success(`Added ${selectedIds.size} vulnerabilities to ${activeTray.name}`);
    setSelectedIds(new Set());
  };

  const { data, isLoading } = useQuery({
    queryKey: ["report", reportId],
    queryFn: async () => {
      if (cache[reportId]) return cache[reportId];

      const res = await fetch(`/api/report?reportId=${reportId}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const summary: ReportSummaryResponse = await res.json();

      const details: Vulnerability[] = await Promise.all(
        summary.vulnerabilities.map(async (v) => {
          const detailRes = await fetch(`/api/vulnerabilities/${v.id}`);
          if (!detailRes.ok)
            return { ...v, description: "", recommendation: "" } as Vulnerability;
          return detailRes.json();
        }),
      );

      return { ...summary, vulnerabilities: details } as CachedReport;
    },
  });

  // Reset filters when switching reports
  useEffect(() => {
    setFilters(initialFilters);
    setSelectedIds(new Set());
  }, [reportId]);

  useEffect(() => {
    if (data && !cache[reportId]) {
      addReport(reportId, data);
    }
  }, [data, reportId, cache, addReport]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.vulnerabilities.filter((v) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !v.title.toLowerCase().includes(q) &&
          !v.asset.toLowerCase().includes(q)
        )
          return false;
      }
      if (
        filters.severities.length &&
        !filters.severities.includes(v.severity)
      )
        return false;
      if (
        filters.categories.length &&
        !filters.categories.includes(getCategoryForTitle(v.title))
      )
        return false;
      if (filters.scopes.length && !filters.scopes.includes(v.scopeId))
        return false;
      if (filters.dateRange.from || filters.dateRange.to) {
        const vulnDate = new Date(v.discoveredAt);
        if (filters.dateRange.from) {
          const fromStart = new Date(filters.dateRange.from);
          fromStart.setHours(0, 0, 0, 0);
          if (vulnDate < fromStart) return false;
        }
        if (filters.dateRange.to) {
          const toEnd = new Date(filters.dateRange.to);
          toEnd.setHours(23, 59, 59, 999);
          if (vulnDate > toEnd) return false;
        }
      }
      return true;
    });
  }, [data, filters]);

  return (
    <Flex col gap={6} className="p-6">
      <ReportHeader
        summary={data?.summary}
        scopes={data?.scopes}
        totalVulnerabilities={data?.vulnerabilities.length}
        isLoading={isLoading}
        reportId={reportId}
        selectedCount={selectedIds.size}
        onAddSelectedToTray={handleAddSelectedToTray}
      />
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        scopes={data?.scopes ?? []}
      />
      <VulnerabilityTable
        vulnerabilities={filtered}
        scopes={data?.scopes ?? []}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </Flex>
  );
}
