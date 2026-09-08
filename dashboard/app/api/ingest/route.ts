import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dispatchIngest } from "@/lib/github";

// The "endpoint - fetch whole text" from the pipeline sketch: accepts raw text,
// stashes it in the 'sources' bucket (GitHub's repository_dispatch payload caps at
// ~64KB, too small for a whole book/article), then kicks off the Quote Maker workflow.
export async function POST(req: NextRequest) {
  const { text, name } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const path = `${(name || "source").replace(/[^a-z0-9-_]/gi, "_")}-${Date.now()}.txt`;
  const { error } = await supabaseAdmin()
    .storage.from("sources")
    .upload(path, text, { contentType: "text/plain" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await dispatchIngest(path);
  return NextResponse.json({ source_path: path });
}
