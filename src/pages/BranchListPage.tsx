import React, { useEffect, useState } from "react";

function erpRequest(path: string, init: RequestInit = {}) {
  const env: any = (import.meta as any).env || {};
  const base = String(env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
  const auth = (env.VITE_AUTH_METHOD || "session").toLowerCase();
  const headers: Record<string, string> = {};
  if (auth === "token" && env.VITE_API_KEY && env.VITE_API_SECRET) {
    headers.Authorization = `token ${env.VITE_API_KEY}:${env.VITE_API_SECRET}`;
  }
  return fetch(`${base}/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers, ...(init.headers as any) },
    credentials: auth === "session" ? "include" : "same-origin",
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?._server_messages || j?.exception || r.statusText);
    return j;
  });
}

export default function BranchListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.set("fields", JSON.stringify(["name", "branch", "branch_name"]));
      if (q) query.set("filters", JSON.stringify([["Branch", "branch", "like", `%${q}%`]]));
      const res = await erpRequest(`api/resource/Branch?${query.toString()}`);
      setRows(res?.data || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Search branch"
               value={q} onChange={e=>setQ(e.target.value)} />
        <button className="px-3 py-2 border rounded-xl" onClick={load}>Search</button>
      </div>
      {loading && <div>Loading…</div>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.branch || r.branch_name || r.name}</div>
            <div className="text-xs text-gray-600">Name: {r.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}