import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth client (adds Authorization: Bearer ...)

type ResultRow = { serial: string; ok: boolean; msg?: string };

export default function AssetBatchCreatePage() {
  const [item_code, setItemCode] = useState("");
  const [company, setCompany] = useState("");
  const [baseName, setBaseName] = useState("HP Thin Client Laptop");
  const [serials, setSerials] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultRow[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const list = serials.split("\n").map(s => s.trim()).filter(Boolean);
    if (!item_code || list.length === 0) {
      alert("Provide item code and at least one serial");
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      // create sequentially (simpler server-side) — or batch with Promise.allSettled if you prefer
      const out: ResultRow[] = [];
      for (const sn of list) {
        const body: Record<string, any> = {
          item_code,
          asset_name: baseName ? `${baseName} - ${sn}` : sn,
          serial_no: sn,
        };
        if (company) body.company = company;

        try {
          await erpFetch("api/resource/Asset", { method: "POST", body: JSON.stringify(body) });
          out.push({ serial: sn, ok: true });
        } catch (err: any) {
          out.push({ serial: sn, ok: false, msg: err?.message || String(err) });
        }
      }
      setResults(out);
      // clear textarea if everything succeeded
      if (out.every(r => r.ok)) setSerials("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs">Item Code</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={item_code}
          onChange={(e) => setItemCode(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs">Company (optional)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs">Base Name (for asset_name)</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={baseName}
          onChange={(e) => setBaseName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs">Serial Numbers (one per line)</label>
        <textarea
          className="border rounded-xl px-3 py-2 w-full h-40"
          value={serials}
          onChange={(e) => setSerials(e.target.value)}
          placeholder={"SN001\nSN002\nSN003"}
        />
      </div>

      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Assets"}
      </button>

      {results.length > 0 && (
        <div className="text-sm">
          <div className="mt-3 font-medium">Results</div>
          <ul className="mt-1 space-y-1">
            {results.map((r) => (
              <li key={r.serial} className={r.ok ? "text-green-700" : "text-red-700"}>
                {r.serial}: {r.ok ? "Created" : r.msg || "Failed"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}