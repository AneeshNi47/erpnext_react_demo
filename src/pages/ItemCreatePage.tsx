import React, { useState } from "react";

function erpRequest(path: string, init: RequestInit = {}) {
  const env: any = (import.meta as any).env || {};
  const base = String(env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
  const auth = (env.VITE_AUTH_METHOD || "session").toLowerCase();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth === "token" && env.VITE_API_KEY && env.VITE_API_SECRET) {
    headers.Authorization = `token ${env.VITE_API_KEY}:${env.VITE_API_SECRET}`;
  }
  return fetch(`${base}/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as any) },
    credentials: auth === "session" ? "include" : "same-origin",
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?._server_messages || j?.exception || r.statusText);
    return j;
  });
}

export default function ItemCreatePage() {
  const [item_code, setCode] = useState("");
  const [item_name, setName] = useState("");
  const [item_group, setGroup] = useState("All Item Groups");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await erpRequest("api/resource/Item", {
        method: "POST",
        body: JSON.stringify({
          item_code,
          item_name,
          item_group,
          is_fixed_asset: 1, // mark as asset type
          is_stock_item: 0,
        }),
      });
      alert("Item created");
      setCode(""); setName("");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Item Code</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={item_code} onChange={(e)=>setCode(e.target.value)} required />
      </div>
      <div>
        <label className="text-xs">Item Name</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={item_name} onChange={(e)=>setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-xs">Item Group</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={item_group} onChange={(e)=>setGroup(e.target.value)} />
      </div>
      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Item"}
      </button>
    </form>
  );
}