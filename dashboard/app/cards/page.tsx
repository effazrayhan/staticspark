"use client";

import { useEffect, useRef, useState } from "react";

type Card = {
  id: number;
  quote: string;
  author: string | null;
  image_url: string;
  status: "ready" | "posted";
  posted_platforms: string[];
};

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const dragId = useRef<number | null>(null);

  const load = () => fetch("/api/cards").then((r) => r.json()).then(setCards);

  useEffect(() => {
    load();
  }, []);

  async function saveOrder(next: Card[]) {
    setCards(next);
    await fetch("/api/cards", {
      method: "PATCH",
      body: JSON.stringify({ order: next.map((c) => c.id) }),
    });
  }

  function onDrop(targetId: number) {
    if (dragId.current === null || dragId.current === targetId) return;
    const from = cards.findIndex((c) => c.id === dragId.current);
    const to = cards.findIndex((c) => c.id === targetId);
    const next = [...cards];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    saveOrder(next);
  }

  async function remove(id: number) {
    setCards((cs) => cs.filter((c) => c.id !== id));
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Card gallery</h1>
      <p className="text-sm text-neutral-500">Drag to reorder the posting queue.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => (dragId.current = c.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(c.id)}
            className="border border-neutral-200 rounded overflow-hidden cursor-move bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image_url} alt={c.quote} className="w-full aspect-square object-cover" />
            <div className="p-2 flex items-center justify-between text-xs text-neutral-500">
              <span>{c.status === "posted" ? `Posted (${c.posted_platforms.join(", ")})` : "Ready"}</span>
              <button onClick={() => remove(c.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
