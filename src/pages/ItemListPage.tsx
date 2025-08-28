import { useEffect, useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth Bearer client

export default function ItemListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      qs.set("fields", JSON.stringify(["name", "item_code", "item_name", "is_fixed_asset", "item_group"]));

      if (q) {
        qs.set(
          "filters",
          JSON.stringify([
            ["Item", "item_name", "like", `%${q}%`],
            "or",
            ["Item", "item_code", "like", `%${q}%`],
          ])
        );
      }

      const res: any = await erpFetch(`api/resource/Item?${qs.toString()}`);
      setRows(res?.data || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load items");
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
          placeholder="Search item (name or code)"
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
            <div className="font-medium">{r.item_name || r.item_code || r.name}</div>
            <div className="text-xs text-gray-600">Code: {r.item_code || r.name}</div>
            <div className="text-xs text-gray-600">Group: {r.item_group || "—"}</div>
            <div className="text-xs text-gray-600">Asset Type: {r.is_fixed_asset ? "Yes" : "No"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}