import { useEffect, useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth Bearer client

export default function DepartmentListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      qs.set("fields", JSON.stringify(["name", "department_name", "company"]));
      if (q) {
        qs.set(
          "filters",
          JSON.stringify([
            ["Department", "department_name", "like", `%${q}%`],
            "or",
            ["Department", "name", "like", `%${q}%`],
          ])
        );
      }
      const res: any = await erpFetch(`api/resource/Department?${qs.toString()}`);
      setRows(res?.data || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load departments");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Search department"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-3 py-2 border rounded-xl" onClick={load}>
          Search
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <ul className="space-y-2">
        {rows.map((r: any) => (
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.department_name || r.name}</div>
            <div className="text-xs text-gray-600">Company: {r.company || "—"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}