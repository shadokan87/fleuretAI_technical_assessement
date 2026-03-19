import { NextResponse } from "next/server";
import { ReportService } from "../../../api/services";
import status from "http-status";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId") || "report-001";

  const reportService = new ReportService();
  const summary = await reportService.getReportSummary(reportId);
  
  if (!summary) {
    return NextResponse.json({ error: "Report not found" }, { status: status.NOT_FOUND });
  }

  return NextResponse.json(summary);
}
