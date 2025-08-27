import React, { useState } from "react";

function erpRequest(path: string, init: RequestInit = {}) {
  const env: any = (import.meta as any).env || {};
  const base = String(env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
  const auth = (env.VITE_AUTH_METHOD || "session").toLowerCase();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth === "token" && env.VITE_API_KEY && env.VITE_API_SECRET) {
    headers.Authorization = `token ${env.VITE_API_KEY}:${env.VITE_API_SECRET}`;
  }
  return fetch(`${base}/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as any) },
    credentials: auth === "session" ? "include" : "same-origin",
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?._server_messages || j?.exception || r.statusText);
    return j;
  });
}

export default function EmployeeCreatePage() {
  const [employee_name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [date_of_joining, setDoj] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await erpRequest("api/resource/Employee", {
        method: "POST",
        body: JSON.stringify({
          employee_name,
          company: company || undefined,
          branch: branch || undefined,
          department: department || undefined,
          date_of_joining: date_of_joining || undefined,
        }),
      });
      alert("Employee created");
      setName(""); setCompany(""); setBranch(""); setDepartment(""); setDoj("");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="text-xs">Employee Name</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={employee_name} onChange={(e)=>setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs">Company (optional)</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={company} onChange={(e)=>setCompany(e.target.value)} />
        </div>
        <div>
          <label className="text-xs">Branch (optional)</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={branch} onChange={(e)=>setBranch(e.target.value)} />
        </div>
        <div>
          <label className="text-xs">Department (optional)</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={department} onChange={(e)=>setDepartment(e.target.value)} />
        </div>
        <div>
          <label className="text-xs">Date of Joining</label>
          <input type="date" className="border rounded-xl px-3 py-2 w-full" value={date_of_joining} onChange={(e)=>setDoj(e.target.value)} />
        </div>
      </div>
      <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={loading}>
        {loading ? "Creating…" : "Create Employee"}
      </button>
    </form>
  );
}