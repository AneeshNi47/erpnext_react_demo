import React, { useEffect, useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // <-- OAuth client (adds Authorization: Bearer ...)

export default function AssetListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      qs.set("fields", JSON.stringify(["name","item_name","asset_name","status","custodian","location"]));
      if (q) qs.set("filters", JSON.stringify([["Asset","item_name","like",`%${q}%`]]));

      // No headers/credentials needed; erpFetch injects Authorization: Bearer <token>
      const res: any = await erpFetch(`api/resource/Asset?${qs.toString()}`);
      setRows(res?.data || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load assets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Search asset item name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-3 py-2 border rounded-xl" onClick={load}>Search</button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <ul className="space-y-2">
        {rows.map((r: any) => (
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.asset_name || r.item_name || r.name}</div>
            <div className="text-xs text-gray-600">SN: {r.serial_no || "-"}</div>
            <div className="text-xs text-gray-600">Custodian: {r.custodian || "-"}</div>
            <div className="text-xs text-gray-600">Location: {r.location || "-"}</div>
            <div className="text-xs text-gray-600">Status: {r.status || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}