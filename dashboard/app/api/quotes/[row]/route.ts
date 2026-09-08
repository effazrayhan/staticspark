import { NextRequest, NextResponse } from "next/server";
import { setQuoteStatus } from "@/lib/sheets";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ row: string }> }) {
  const { row } = await params;
  const { status } = await req.json();
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
  }
  await setQuoteStatus(Number(row), status);
  return NextResponse.json({ ok: true });
}
