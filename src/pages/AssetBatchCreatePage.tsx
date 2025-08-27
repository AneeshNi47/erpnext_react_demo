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

export default function AssetBatchCreatePage() {
  const [item_code, setItemCode] = useState("");
  const [company, setCompany] = useState("");
  const [baseName, setBaseName] = useState("HP Thin Client Laptop");
  const [serials, setSerials] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const list = serials.split("\n").map(s => s.trim()).filter(Boolean);
    if (!item_code || list.length === 0) { alert("Provide item code and at least one serial"); return; }
    setLoading(true);
    try {
      for (const sn of list) {
        const body: any = {
          item_code,
          asset_name: baseName ? `${baseName} - ${sn}` : sn,
          serial_no: sn,
        };
        if (company) body.company = company;
        await erpRequest("api/resource/Asset", { method: "POST", body: JSON.stringify(body) });
      }
      alert(`Created ${list.length} assets`);
      setSerials("");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Item Code</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={item_code} onChange={(e)=>setItemCode(e.target.value)} required />
      </div>
      <div>
        <label className="text-xs">Company (optional)</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={company} onChange={(e)=>setCompany(e.target.value)} />
      </div>
      <div>
        <label className="text-xs">Base Name (for asset_name)</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={baseName} onChange={(e)=>setBaseName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs">Serial Numbers (one per line)</label>
        <textarea className="border rounded-xl px-3 py-2 w-full h-40" value={serials} onChange={(e)=>setSerials(e.target.value)} placeholder={"SN001\nSN002\nSN003"} />
      </div>
      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Assets"}
      </button>
    </form>
  );
}