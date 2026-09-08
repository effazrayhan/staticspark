"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit() {
    const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) router.push("/");
    else setError("Wrong password");
  }

  return (
    <div className="max-w-sm mx-auto mt-20 space-y-3">
      <h1 className="text-lg font-semibold">Static Spark dashboard</h1>
      <input
        type="password"
        className="w-full border border-neutral-300 rounded px-2 py-1.5 text-sm"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button onClick={submit} className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm">
        Sign in
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
