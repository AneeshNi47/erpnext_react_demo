import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // <-- OAuth client (adds Authorization: Bearer ...)

export default function BranchCreatePage() {
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!branch.trim()) return;

    setLoading(true);
    setErr(null);
    try {
      const body: Record<string, any> = {
        branch,
        branch_name: branch,            // keep both if your DocType expects them
      };
      if (company.trim()) body.company = company.trim();

      await erpFetch("api/resource/Branch", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert("Branch created");
      setBranch("");
      setCompany("");
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Branch Name</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
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

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Branch"}
      </button>
    </form>
  );
}