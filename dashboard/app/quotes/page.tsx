"use client";

import { useEffect, useState } from "react";

type Quote = { row: number; quote: string; author: string; status: string; source: string };

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuotes(data);
          setError(null);
        } else {
          setError(data.error ?? "Failed to load quotes.");
        }
      });

  useEffect(() => {
    load();
  }, []);

  async function decide(row: number, status: "approved" | "rejected") {
    setQuotes((qs) => qs.filter((q) => q.row !== row));
    await fetch(`/api/quotes/${row}`, { method: "PATCH", body: JSON.stringify({ status }) });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Quote review queue</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && quotes.length === 0 && <p className="text-sm text-neutral-500">Nothing pending.</p>}
      {quotes.map((q) => (
        <div key={q.row} className="border border-neutral-200 rounded p-4 space-y-2">
          <p className="italic">&ldquo;{q.quote}&rdquo;</p>
          {q.author && <p className="text-sm text-neutral-500">— {q.author}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => decide(q.row, "approved")}
              className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
            >
              Approve
            </button>
            <button
              onClick={() => decide(q.row, "rejected")}
              className="px-3 py-1 rounded bg-red-600 text-white text-sm"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
