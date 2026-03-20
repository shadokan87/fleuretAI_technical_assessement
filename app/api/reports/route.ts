import { NextResponse } from "next/server";
import { ReportService } from "@/api/services";

const service = new ReportService();

export async function GET() {
  const reports = service.getReportList();
  return NextResponse.json(reports);
}
