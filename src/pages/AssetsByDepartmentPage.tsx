import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // <-- OAuth Bearer client

export default function AssetsByDepartmentPage() {
  const [dept, setDept] = useState(""); // Department.name
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    if (!dept) { setRows([]); return; }
    setLoading(true);
    try {
      // 1) Employees in the department
      const q1 = new URLSearchParams();
      q1.set("fields", JSON.stringify(["name"]));
      q1.set("filters", JSON.stringify([["Employee","department","=",dept]]));
      const emp: any = await erpFetch(`api/resource/Employee?${q1.toString()}`);
      const ids: string[] = (emp?.data || []).map((e: any) => e.name);
      if (ids.length === 0) { setRows([]); return; }

      // 2) Assets where custodian IN employees (omit serial_no in list)
      const q2 = new URLSearchParams();
      q2.set("fields", JSON.stringify(["name","asset_name","item_name","custodian","status"]));
      q2.set("filters", JSON.stringify([["Asset","custodian","in",ids]]));
      const assetsList: any = await erpFetch(`api/resource/Asset?${q2.toString()}`);
      const baseRows = assetsList?.data || [];

      // 3) Lazy-load serial_no per asset via detail endpoint
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
        <label className="text-xs">Department ID (Department.name)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          placeholder="HR-Dept"
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
            <div className="text-xs text-gray-600">Custodian: {r.custodian || "-"}</div>
            <div className="text-xs text-gray-600">Status: {r.status || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}