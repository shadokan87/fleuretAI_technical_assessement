import { NextResponse } from "next/server";
import { VlnService } from "../../../../api/services";
import status from "http-status";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    void request;
    const { id } = await params;
    const vlnService = new VlnService();
    const vuln = await vlnService.getVlnDetail(id);

    if (!vuln) {
        return NextResponse.json({ error: "Vulnerability not found" }, { status: status.NOT_FOUND });
    }

    return NextResponse.json(vuln);
}
