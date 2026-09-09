import { NextResponse } from "next/server";
import { listQuotes } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const quotes = await listQuotes("pending");
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
