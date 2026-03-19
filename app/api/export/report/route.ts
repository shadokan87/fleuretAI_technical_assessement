import { NextResponse } from "next/server";
import type {
  TDocumentDefinitions,
  Content,
  TableCell,
  TFontDictionary,
} from "pdfmake/interfaces";
import path from "path";
import { ReportService, VlnService } from "../../../../api/services";
import { markdownToPdfmake } from "../../../../lib/markdownToPdfmake";
import { Vulnerability, Scope } from "../../../../api/types";
import status from "http-status";

// Server-side: use PdfPrinter with actual TTF file paths
const FONT_DIR = path.join(process.cwd(), "node_modules/pdfmake/fonts/Roboto");

const fontDescriptors: TFontDictionary = {
  Roboto: {
    normal: path.join(FONT_DIR, "Roboto-Regular.ttf"),
    bold: path.join(FONT_DIR, "Roboto-Medium.ttf"),
    italics: path.join(FONT_DIR, "Roboto-Italic.ttf"),
    bolditalics: path.join(FONT_DIR, "Roboto-MediumItalic.ttf"),
  },
};

const SEVERITY_ORDER = ["Critical", "High", "Medium", "Low", "Info"];
const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#ea580c",
  Medium: "#ca8a04",
  Low: "#2563eb",
  Info: "#6b7280",
};

function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#ca8a04";
  return "#dc2626";
}

function buildCoverPage(
  reportId: string,
  scanDate: string,
  score: number,
  vulnCount: Record<string, number>,
  scopes: Scope[]
): Content[] {
  const dateStr = new Date(scanDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const severityRows: TableCell[][] = SEVERITY_ORDER.map((sev) => [
    {
      text: sev,
      bold: true,
      color: SEVERITY_COLORS[sev],
      fontSize: 10,
    },
    {
      text: String(vulnCount[sev.toLowerCase()] ?? 0),
      alignment: "center",
      fontSize: 10,
    },
  ]);

  const scopeLines = scopes
    .map((s) => s.domain ?? s.ipAddress ?? s.id)
    .join(", ");

  return [
    // Header band
    {
      canvas: [
        {
          type: "rect",
          x: 0,
          y: 0,
          w: 595,
          h: 200,
          color: "#111827",
        },
      ],
      absolutePosition: { x: 0, y: 0 },
    } as any,
    {
      text: "PENTEST REPORT",
      fontSize: 28,
      bold: true,
      color: "#ffffff",
      margin: [40, 60, 40, 4],
      characterSpacing: 3,
    } as any,
    {
      text: reportId,
      fontSize: 13,
      color: "#9ca3af",
      margin: [40, 0, 40, 0],
    } as any,
    {
      text: `Scan date: ${dateStr}`,
      fontSize: 10,
      color: "#6b7280",
      margin: [40, 6, 40, 80],
    } as any,

    // Score card + vuln table
    {
      columns: [
        {
          stack: [
            { text: "Security Score", fontSize: 12, bold: true, color: "#374151", margin: [0, 0, 0, 6] },
            {
              text: String(score),
              fontSize: 60,
              bold: true,
              color: scoreColor(score),
              lineHeight: 1,
            },
            { text: "/ 100", fontSize: 14, color: "#6b7280", margin: [0, 2, 0, 0] },
          ],
          width: 180,
          margin: [40, 30, 0, 0],
        },
        {
          stack: [
            { text: "Vulnerability Summary", fontSize: 12, bold: true, color: "#374151", margin: [0, 0, 0, 8] },
            {
              table: {
                widths: [90, 40],
                body: [
                  [
                    { text: "Severity", bold: true, fontSize: 9, color: "#6b7280", fillColor: "#f9fafb" },
                    { text: "Count", bold: true, fontSize: 9, color: "#6b7280", alignment: "center", fillColor: "#f9fafb" },
                  ],
                  ...severityRows,
                ],
              },
              layout: "lightHorizontalLines",
            },
          ],
          margin: [20, 30, 40, 0],
        },
      ],
    } as any,

    // Scopes
    {
      stack: [
        { text: "Scope", fontSize: 11, bold: true, color: "#374151", margin: [0, 0, 0, 4] },
        { text: scopeLines, fontSize: 10, color: "#4b5563" },
      ],
      margin: [40, 30, 40, 0],
    } as any,

    { text: "", pageBreak: "after" } as any,
  ];
}

function buildSommaire(vulns: Vulnerability[]): Content[] {
  const rows: TableCell[][] = vulns.map((v, i) => [
    { text: String(i + 1), fontSize: 9, color: "#6b7280", alignment: "center" },
    { text: v.title, fontSize: 9, bold: true },
    { text: v.severity, fontSize: 9, color: SEVERITY_COLORS[v.severity] ?? "#6b7280", bold: true },
    { text: v.asset, fontSize: 9, color: "#6b7280" },
  ]);

  return [
    { text: "Sommaire", fontSize: 18, bold: true, margin: [0, 0, 0, 16] } as any,
    {
      table: {
        widths: [20, "*", 60, 120],
        body: [
          [
            { text: "#", bold: true, fontSize: 9, fillColor: "#f3f4f6", alignment: "center" },
            { text: "Title", bold: true, fontSize: 9, fillColor: "#f3f4f6" },
            { text: "Severity", bold: true, fontSize: 9, fillColor: "#f3f4f6" },
            { text: "Asset", bold: true, fontSize: 9, fillColor: "#f3f4f6" },
          ],
          ...rows,
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 0],
    } as any,
    { text: "", pageBreak: "after" } as any,
  ];
}

function buildVulnerabilityPage(vuln: Vulnerability, index: number, scope: Scope | undefined): Content[] {
  const scopeLabel = scope?.domain ?? scope?.ipAddress ?? vuln.scopeId;

  return [
    // Vuln header
    {
      stack: [
        {
          columns: [
            {
              text: `${index + 1}. ${vuln.title}`,
              fontSize: 16,
              bold: true,
              color: "#111827",
              width: "*",
            },
            {
              stack: [
                {
                  text: vuln.severity.toUpperCase(),
                  fontSize: 9,
                  bold: true,
                  color: "#ffffff",
                  background: SEVERITY_COLORS[vuln.severity] ?? "#6b7280",
                  alignment: "center",
                  padding: [6, 3, 6, 3],
                },
              ],
              width: 70,
            },
          ],
        },
        {
          columns: [
            { text: `Asset: `, fontSize: 9, bold: true, color: "#374151", width: "auto" },
            { text: vuln.asset, fontSize: 9, color: "#6b7280", width: "*" },
            { text: `Scope: `, fontSize: 9, bold: true, color: "#374151", width: "auto" },
            { text: scopeLabel, fontSize: 9, color: "#6b7280", width: "auto" },
          ],
          columnGap: 4,
          margin: [0, 4, 0, 0],
        },
      ],
      margin: [0, 0, 0, 12],
    } as any,

    {
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: "#e5e7eb" }],
      margin: [0, 0, 0, 12],
    } as any,

    // Description
    {
      text: "Description",
      fontSize: 12,
      bold: true,
      color: "#111827",
      margin: [0, 0, 0, 6],
    } as any,
    ...markdownToPdfmake(vuln.description),

    { text: "", margin: [0, 8, 0, 0] } as any,

    // Recommendation
    {
      text: "Recommendation",
      fontSize: 12,
      bold: true,
      color: "#111827",
      margin: [0, 0, 0, 6],
    } as any,
    ...markdownToPdfmake(vuln.recommendation),

    { text: "", pageBreak: "after" } as any,
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get("reportId");

  if (!reportId) {
    return NextResponse.json({ error: "reportId is required" }, { status: status.BAD_REQUEST });
  }

  const reportService = new ReportService();
  const vlnService = new VlnService();

  const summary = await reportService.getReportSummary(reportId);
  if (!summary) {
    return NextResponse.json({ error: "Report not found" }, { status: status.NOT_FOUND });
  }

  // Fetch full vulnerability details
  const vulns: Vulnerability[] = (
    await Promise.all(summary.vulnerabilities.map((v) => vlnService.getVlnDetail(v.id)))
  ).filter((v): v is Vulnerability => v !== null);

  // Sort by severity
  vulns.sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const scopeMap = new Map(summary.scopes.map((s) => [s.id, s]));

  const content: Content[] = [
    ...buildCoverPage(
      reportId,
      summary.summary.scanDate,
      summary.summary.globalSecurityScore,
      summary.summary.vulnerabilityCount as any,
      summary.scopes
    ),
    ...buildSommaire(vulns),
    ...vulns.flatMap((v, i) => buildVulnerabilityPage(v, i, scopeMap.get(v.scopeId))),
  ];

  // Remove trailing page break on last page
  const last = content[content.length - 1] as any;
  if (last && last.text === "" && last.pageBreak === "after") {
    delete last.pageBreak;
  }

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 50],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: "#1f2937",
      lineHeight: 1.3,
    },
    styles: {
      header: { fontSize: 18, bold: true },
    },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: reportId, fontSize: 8, color: "#9ca3af", margin: [40, 0, 0, 0] },
        {
          text: `${currentPage} / ${pageCount}`,
          fontSize: 8,
          color: "#9ca3af",
          alignment: "right",
          margin: [0, 0, 40, 0],
        },
      ],
    }),
    content,
  };

  // Server-side PDF generation: use the pdfmake node entry (js/index.js)
  // which is a singleton with .fonts and .createPdf()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfmake = require("pdfmake");
  pdfmake.fonts = fontDescriptors;

  const pdfDoc = pdfmake.createPdf(docDefinition);

  const stream = await pdfDoc.getStream();
  const chunks: Uint8Array[] = [];
  const pdfBuffer: ArrayBuffer = await new Promise((resolve, reject) => {
    stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    stream.on("end", () => {
      const combined = Buffer.concat(chunks);
      resolve(combined.buffer.slice(combined.byteOffset, combined.byteOffset + combined.byteLength) as ArrayBuffer);
    });
    stream.on("error", reject);
    stream.end();
  });

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${reportId}.pdf"`,
      "Content-Length": String(pdfBuffer.byteLength),
    },
  });
}
