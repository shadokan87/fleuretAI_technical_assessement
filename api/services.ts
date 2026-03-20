import mocks from "./mocks.json";
import { ReportSummaryResponse, VulnerabilityDetail, ReportListItem } from "./types";

export class ReportService {
  getReportList(): ReportListItem[] {
    return (mocks as any[]).map((r) => ({
      id: r.id,
      name: r.name,
      scanDate: r.summary.scanDate,
    }));
  }

  async getReportSummary(reportId: string): Promise<ReportSummaryResponse | null> {
    const report: any = mocks.find((r) => r.id === reportId);
    
    if (!report) {
      return null;
    }

    return {
      summary: report.summary,
      scopes: report.scopes,
      vulnerabilities: report.vulnerabilities.map((v: any) => ({
        id: v.id,
        title: v.title,
        severity: v.severity,
        scopeId: v.scopeId,
        asset: v.asset,
        discoveredAt: v.discoveredAt,
      })),
    };
  }
}

export class VlnService {
  async getVlnDetail(id: string): Promise<VulnerabilityDetail | null> {
    for (const report of mocks) {
      const vuln = report.vulnerabilities.find((v: any) => v.id === id);
      if (vuln) {
        return vuln as VulnerabilityDetail;
      }
    }
    return null;
  }
}
