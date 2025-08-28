import { useState } from "react";
import { erpFetch } from "../lib/erp-oauth"; // OAuth Bearer client

export default function EmployeeCreatePage() {
  const [employee_name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [date_of_joining, setDoj] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employee_name.trim()) return;

    setLoading(true);
    setErr(null);
    try {
      const body: Record<string, any> = {
        employee_name: employee_name.trim(),
      };
      if (company.trim()) body.company = company.trim();
      if (branch.trim()) body.branch = branch.trim();
      if (department.trim()) body.department = department.trim();
      if (date_of_joining) body.date_of_joining = date_of_joining; // YYYY-MM-DD

      await erpFetch("api/resource/Employee", {
        method: "POST",
        body: JSON.stringify(body),
      });

      alert("Employee created");
      setName("");
      setCompany("");
      setBranch("");
      setDepartment("");
      setDoj("");
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Employee Name</label>
        <input
          className="border rounded-xl px-3 py-2 w-full"
          value={employee_name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs">Company (optional)</label>
          <input
            className="border rounded-xl px-3 py-2 w-full"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs">Branch (optional)</label>
          <input
            className="border rounded-xl px-3 py-2 w-full"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs">Department (optional)</label>
          <input
            className="border rounded-xl px-3 py-2 w-full"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs">Date of Joining</label>
          <input
            type="date"
            className="border rounded-xl px-3 py-2 w-full"
            value={date_of_joining}
            onChange={(e) => setDoj(e.target.value)}
          />
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Employee"}
      </button>
    </form>
  );
}