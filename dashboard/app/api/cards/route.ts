import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db.from("cards").select("*").order("position");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const withUrls = data.map((c) => ({
    ...c,
    image_url: db.storage.from("cards").getPublicUrl(c.image_path).data.publicUrl,
  }));
  return NextResponse.json(withUrls);
}

// Drag-drop reorder: body { order: number[] } is the full list of card ids in their new order.
export async function PATCH(req: NextRequest) {
  const { order } = (await req.json()) as { order: number[] };
  const db = supabaseAdmin();
  await Promise.all(order.map((id, position) => db.from("cards").update({ position }).eq("id", id)));
  return NextResponse.json({ ok: true });
}
