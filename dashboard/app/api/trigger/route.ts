import { NextRequest, NextResponse } from "next/server";
import { triggerWorkflow } from "@/lib/github";

const WORKFLOWS: Record<string, string> = {
  card_maker: "card_maker.yml",
  post_engine: "post_engine.yml",
};

export async function POST(req: NextRequest) {
  const { job } = await req.json();
  const file = WORKFLOWS[job];
  if (!file) return NextResponse.json({ error: "unknown job" }, { status: 400 });
  await triggerWorkflow(file);
  return NextResponse.json({ ok: true });
}
