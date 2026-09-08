import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: card } = await db.from("cards").select("image_path").eq("id", id).single();
  if (card) await db.storage.from("cards").remove([card.image_path]);
  await db.from("cards").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
