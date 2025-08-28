import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // <-- OAuth client

export default function AssetsByBranchPage() {
  const [branch, setBranch] = useState(""); // Branch.name
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    if (!branch) { setRows([]); return; }
    setLoading(true);
    try {
      // 1) employees in branch
      const q1 = new URLSearchParams();
      q1.set("fields", JSON.stringify(["name"]));
      q1.set("filters", JSON.stringify([["Employee","branch","=",branch]]));
      const emp: any = await erpFetch(`api/resource/Employee?${q1.toString()}`);
      const ids: string[] = (emp?.data || []).map((e: any) => e.name);
      if (ids.length === 0) { setRows([]); return; }

      // 2) assets by custodian IN employees (omit serial_no in list to avoid "Field not permitted" error)
      const q2 = new URLSearchParams();
      q2.set("fields", JSON.stringify(["name","asset_name","item_name","custodian","status"]));
      q2.set("filters", JSON.stringify([["Asset","custodian","in",ids]]));
      const assetsList: any = await erpFetch(`api/resource/Asset?${q2.toString()}`);
      const baseRows = assetsList?.data || [];

      // 3) lazy-fetch serial_no per asset (detail endpoint allows it)
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
        <label className="text-xs">Branch ID (Branch.name)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="BR-001"
        />
      </div>
      <button className="px-3 py-2 border rounded-xl" onClick={load}>Load Assets</button>
      {loading && <div>Loading…</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.asset_name || r.item_name || r.name}</div>
            <div className="text-xs text-gray-600">SN: {r.serial_no ?? "—"}</div>
            <div className="text-xs text-gray-600">Custodian: {r.custodian || "-"}</div>
            <div className="text-xs text-gray-600">Status: {r.status || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}