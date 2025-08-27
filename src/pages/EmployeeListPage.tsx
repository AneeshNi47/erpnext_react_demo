import React, { useEffect, useState } from "react";
const erpRequest = (p:string,i:RequestInit={})=>{
  const e:any=(import.meta as any).env||{},b=String(e.VITE_ERP_BASE_URL||"").replace(/\/$/,""),
        a=(e.VITE_AUTH_METHOD||"session").toLowerCase(),h:any={};
  if(a==="token"&&e.VITE_API_KEY&&e.VITE_API_SECRET) h.Authorization=`token ${e.VITE_API_KEY}:${e.VITE_API_SECRET}`;
  return fetch(`${b}/${p}`,{...i,headers:{"Content-Type":"application/json",...h,...(i.headers as any)},credentials:a==="session"?"include":"same-origin"}).then(async r=>{const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j?._server_messages||j?.exception||r.statusText); return j;});
};

export default function EmployeeListPage(){
  const [rows,setRows]=useState<any[]>([]); const [q,setQ]=useState(""); const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    try{
      const qs=new URLSearchParams();
      qs.set("fields", JSON.stringify(["name","employee_name","branch","department"]));
      if(q) qs.set("filters", JSON.stringify([["Employee","employee_name","like",`%${q}%`]]));
      const res=await erpRequest(`api/resource/Employee?${qs.toString()}`);
      setRows(res?.data||[]);
    } finally { setLoading(false); }
  }
  useEffect(()=>{load();},[]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Search employee"
               value={q} onChange={e=>setQ(e.target.value)} />
        <button className="px-3 py-2 border rounded-xl" onClick={load}>Search</button>
      </div>
      {loading && <div>Loading…</div>}
      <ul className="space-y-2">
        {rows.map(r=>(
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.employee_name || r.name}</div>
            <div className="text-xs text-gray-600">ID: {r.name}</div>
            <div className="text-xs text-gray-600">Branch: {r.branch || "-"}</div>
            <div className="text-xs text-gray-600">Dept: {r.department || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}