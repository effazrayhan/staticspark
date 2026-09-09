import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { listQuotes } from "@/lib/sheets";
import { latestRun } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const [quotes, cardsReady, cardsPosted, quoteMakerRun, cardMakerRun, postEngineRun] =
    await Promise.all([
      listQuotes(),
      supabaseAdmin().from("cards").select("id", { count: "exact", head: true }).eq("status", "ready"),
      supabaseAdmin().from("cards").select("id", { count: "exact", head: true }).eq("status", "posted"),
      latestRun("quote_maker.yml"),
      latestRun("card_maker.yml"),
      latestRun("post_engine.yml"),
    ]);

  const byStatus = (s: string) => quotes.filter((q) => q.status === s).length;

  return NextResponse.json({
    quotes: {
      pending: byStatus("pending"),
      approved: byStatus("approved"),
      carded: byStatus("carded"),
      rejected: byStatus("rejected"),
    },
    cards: {
      ready: cardsReady.count ?? 0,
      posted: cardsPosted.count ?? 0,
    },
    workflows: {
      quote_maker: quoteMakerRun,
      card_maker: cardMakerRun,
      post_engine: postEngineRun,
    },
  });
}
