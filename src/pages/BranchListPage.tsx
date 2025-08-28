import { useEffect, useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // <-- OAuth Bearer client

export default function BranchListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const query = new URLSearchParams();
      // adjust fields to your Branch schema; these are commonly available
      query.set("fields", JSON.stringify(["name", "branch", "branch_name"]));
      if (q) {
        // search by branch or branch_name
        query.set(
          "filters",
          JSON.stringify([
            ["Branch", "branch", "like", `%${q}%`],
            "or",
            ["Branch", "branch_name", "like", `%${q}%`],
          ])
        );
      }
      const res: any = await erpFetch(`api/resource/Branch?${query.toString()}`);
      setRows(res?.data || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load branches");
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
          placeholder="Search branch"
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
            <div className="font-medium">{r.branch || r.branch_name || r.name}</div>
            <div className="text-xs text-gray-600">Name: {r.name}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}