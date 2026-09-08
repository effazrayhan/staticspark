import { NextResponse } from "next/server";
import { listQuotes } from "@/lib/sheets";

export async function GET() {
  const quotes = await listQuotes("pending");
  return NextResponse.json(quotes);
}
