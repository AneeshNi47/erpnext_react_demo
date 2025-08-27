import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { erpFetch } from "../lib/erp-oauth";

type CountState = { branches?: number; departments?: number; employees?: number; assets?: number };
type LoadState = "idle" | "loading" | "done" | "error";

export default function HomePage() {
  const [counts, setCounts] = useState<CountState>({});
  const [status, setStatus] = useState<LoadState>("idle");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const [branches, departments, employees, assets] = await Promise.all([
          // frappe.client.get_count is whitelisted and fast
          erpFetch(`api/method/frappe.client.get_count?doctype=Branch`),
          erpFetch(`api/method/frappe.client.get_count?doctype=Department`),
          erpFetch(`api/method/frappe.client.get_count?doctype=Employee`),
          erpFetch(`api/method/frappe.client.get_count?doctype=Asset`),
        ]);
        setCounts({
          branches: branches?.message ?? 0,
          departments: departments?.message ?? 0,
          employees: employees?.message ?? 0,
          assets: assets?.message ?? 0,
        });
        setStatus("done");
      } catch (e: any) {
        setErr(e.message || String(e));
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>

      {status === "loading" && <div className="text-sm text-gray-600">Loading…</div>}
      {status === "error" && <div className="text-sm text-red-600">Error: {err}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <HomeCard to="/list/branches" title="Branches" value={counts.branches} subtitle="Manage branches" />
        <HomeCard to="/list/departments" title="Departments" value={counts.departments} subtitle="Org units" />
        <HomeCard to="/list/employees" title="Employees" value={counts.employees} subtitle="People directory" />
        <HomeCard to="/list/assets" title="Assets" value={counts.assets} subtitle="Assigned & available" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction to="/create/branch" label="Create Branch" />
        <QuickAction to="/create/department" label="Create Department" />
        <QuickAction to="/create/employee" label="Create Employee" />
      </div>
    </div>
  );
}

function HomeCard({ to, title, value, subtitle }: { to: string; title: string; value?: number; subtitle: string }) {
  return (
    <Link to={to} className="block border rounded-2xl p-4 hover:shadow-md transition">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-semibold mt-1">{value ?? "—"}</div>
      <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
    </Link>
  );
}

function QuickAction({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="block border rounded-2xl p-4 hover:shadow-md transition">
      <div className="font-medium">{label}</div>
      <div className="text-xs text-gray-500 mt-1">Go to form</div>
    </Link>
  );
}