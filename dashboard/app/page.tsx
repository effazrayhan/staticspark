"use client";

import { useEffect, useState } from "react";

type Status = {
  quotes: { pending: number; approved: number; carded: number; rejected: number };
  cards: { ready: number; posted: number };
  workflows: Record<string, { status: string; conclusion: string | null; ran_at: string } | null>;
};

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = () => fetch("/api/status").then((r) => r.json()).then(setStatus);

  useEffect(() => {
    load();
  }, []);

  async function ingest() {
    setBusy("ingest");
    setMessage("");
    const res = await fetch("/api/ingest", {
      method: "POST",
      body: JSON.stringify({ text, name }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Queued ${data.source_path}` : `Error: ${data.error}`);
    setText("");
    setBusy(null);
  }

  async function trigger(job: string) {
    setBusy(job);
    await fetch("/api/trigger", { method: "POST", body: JSON.stringify({ job }) });
    setMessage(`Triggered ${job}`);
    setBusy(null);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-xl font-semibold">Pipeline status</h1>

      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <Stat label="Quotes pending review" value={status.quotes.pending} />
          <Stat label="Quotes approved" value={status.quotes.approved} />
          <Stat label="Quotes carded" value={status.quotes.carded} />
          <Stat label="Cards ready to post" value={status.cards.ready} />
          <Stat label="Cards posted" value={status.cards.posted} />
        </div>
      )}

      {status && (
        <div className="space-y-2 text-sm">
          <h2 className="font-medium">Last workflow runs</h2>
          {Object.entries(status.workflows).map(([job, run]) => (
            <div key={job} className="flex justify-between border-b border-neutral-200 py-1">
              <span>{job}</span>
              <span className="text-neutral-500">
                {run ? `${run.status}/${run.conclusion ?? "-"} at ${new Date(run.ran_at).toLocaleString()}` : "never run"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          disabled={busy === "card_maker"}
          onClick={() => trigger("card_maker")}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm disabled:opacity-50"
        >
          Run Card Maker now
        </button>
        <button
          disabled={busy === "post_engine"}
          onClick={() => trigger("post_engine")}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm disabled:opacity-50"
        >
          Run Post Engine now
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium text-sm">Ingest whole text</h2>
        <input
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
          placeholder="Source name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm h-40"
          placeholder="Paste the whole text to extract quotes from..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          disabled={!text || busy === "ingest"}
          onClick={ingest}
          className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm disabled:opacity-50"
        >
          Send to Quote Maker
        </button>
      </div>

      {message && <p className="text-sm text-neutral-600">{message}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-neutral-200 rounded p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-neutral-500">{label}</div>
    </div>
  );
}
