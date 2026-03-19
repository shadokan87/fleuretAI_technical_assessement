"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { ReportSummaryResponse, Vulnerability } from "@/api/types";

export type CachedReport = Omit<ReportSummaryResponse, "vulnerabilities"> & {
  vulnerabilities: Vulnerability[];
};

interface ReportsCacheContextType {
  /** Dictionary of cached reports, keyed by report ID */
  cache: Record<string, CachedReport>;
  /** Adds or updates a complete report in the cache */
  addReport: (id: string, reportData: CachedReport) => void;
  /** Helper to find which cached report contains a specific vulnerability ID */
  getReportByVulnId: (vulnId: string) => CachedReport | undefined;
}

const ReportsCacheContext = createContext<ReportsCacheContextType | undefined>(undefined);

export function ReportsCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Record<string, CachedReport>>({});

  const addReport = useCallback((id: string, data: CachedReport) => {
    setCache((prev) => ({ ...prev, [id]: data }));
  }, []);

  const getReportByVulnId = useCallback((vulnId: string) => {
    return Object.values(cache).find((report) => 
      report.vulnerabilities.some((v) => v.id === vulnId)
    );
  }, [cache]);

  return (
    <ReportsCacheContext.Provider value={{ cache, addReport, getReportByVulnId }}>
      {children}
    </ReportsCacheContext.Provider>
  );
}

/**
 * Hook to access and manage the localized cache of vulnerability reports.
 * 
 * @example
 * ```tsx
 * const { cache, addReport, getReportByVulnId } = useReportsCache();
 * 
 * // 1. Add a fetched report to the cache
 * useEffect(() => {
 *   if (fetchedData) {
 *     addReport(reportId, fetchedData);
 *   }
 * }, [fetchedData]);
 * 
 * // 2. Retrieve a cached report based on a known vulnerability ID
 * const cachedReport = getReportByVulnId("vuln-001-2");
 * if (cachedReport) {
 *   console.log("Found cached data for this vulnerability!");
 * }
 * ```
 * 
 * @throws {Error} If called outside a `<ReportsCacheProvider>` component tree.
 */
export function useReportsCache() {
  const ctx = useContext(ReportsCacheContext);
  if (!ctx) {
    throw new Error("useReportsCache must be used within a ReportsCacheProvider");
  }
  return ctx;
}