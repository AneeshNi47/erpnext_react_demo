import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth Bearer client

export default function ItemCreatePage() {
  const [item_code, setCode] = useState("");
  const [item_name, setName] = useState("");
  const [item_group, setGroup] = useState("All Item Groups");
  const [asset_category, setAssetCategory] = useState(""); // optional, depends on your ERPNext config
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item_code.trim() || !item_name.trim()) return;

    setLoading(true);
    setErr(null);
    try {
      const body: Record<string, any> = {
        item_code: item_code.trim(),
        item_name: item_name.trim(),
        item_group: item_group.trim() || "All Item Groups",
        is_fixed_asset: 1,   // mark as asset
        is_stock_item: 0,
        // maintain_serial_no: 1, // enable if you want serials on Items
        // default_unit_of_measure: "Nos", // set if required by your instance
      };
      if (asset_category.trim()) body.asset_category = asset_category.trim();

      await erpFetch("api/resource/Item", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert("Item created");
      setCode("");
      setName("");
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Item Code</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={item_code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs">Item Name</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={item_name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs">Item Group</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={item_group}
          onChange={(e) => setGroup(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs">Asset Category (optional)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={asset_category}
          onChange={(e) => setAssetCategory(e.target.value)}
          placeholder="Computers"
        />
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Item"}
      </button>
    </form>
  );
}