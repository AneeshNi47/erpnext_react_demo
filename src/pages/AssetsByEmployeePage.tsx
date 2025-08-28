import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth client

export default function AssetsByEmployeePage() {
  const [employeeId, setEmployeeId] = useState(""); // Employee.name
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    if (!employeeId) { setRows([]); return; }
    setLoading(true);
    try {
      // 1) List assets for this custodian (omit serial_no in list)
      const qs = new URLSearchParams();
      qs.set("fields", JSON.stringify(["name","asset_name","item_name","status"]));
      qs.set("filters", JSON.stringify([["Asset","custodian","=",employeeId]]));
      const listRes: any = await erpFetch(`api/resource/Asset?${qs.toString()}`);
      const baseRows = listRes?.data || [];

      // 2) Fetch serial_no per asset via detail endpoint
      const withSerial = await Promise.all(
        baseRows.map(async (r: any) => {
          try {
            const detail: any = await erpFetch(
              `api/resource/Asset/${encodeURIComponent(r.name)}?fields=${encodeURIComponent(JSON.stringify(["name","serial_no"]))}`
            );
            return { ...r, serial_no: detail?.data?.serial_no ?? null };
          } catch {
            return { ...r, serial_no: null };
          }
        })
      );

      setRows(withSerial);
    } catch (e: any) {
      setErr(e.message || "Failed to load assets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs">Employee ID (Employee.name)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="EMP-0001"
        />
      </div>

      <button className="px-3 py-2 border rounded-xl" onClick={load}>Load Assets</button>

      {loading && <div>Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.asset_name || r.item_name || r.name}</div>
            <div className="text-xs text-gray-600">SN: {r.serial_no ?? "—"}</div>
            <div className="text-xs text-gray-600">Status: {r.status || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}