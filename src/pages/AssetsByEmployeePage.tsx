import React, { useEffect, useState } from "react";
const erpRequest=(p:string,i:RequestInit={})=>{
  const e:any=(import.meta as any).env||{},b=String(e.VITE_ERP_BASE_URL||"").replace(/\/$/,""),
        a=(e.VITE_AUTH_METHOD||"session").toLowerCase(),h:any={};
  if(a==="token"&&e.VITE_API_KEY&&e.VITE_API_SECRET) h.Authorization=`token ${e.VITE_API_KEY}:${e.VITE_API_SECRET}`;
  return fetch(`${b}/${p}`,{...i,headers:{"Content-Type":"application/json",...h,...(i.headers as any)},credentials:a==="session"?"include":"same-origin"}).then(async r=>{const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j?._server_messages||j?.exception||r.statusText); return j;});
};

export default function AssetsByEmployeePage(){
  const [employeeId,setEmployeeId]=useState(""); // Employee.name
  const [rows,setRows]=useState<any[]>([]);
  const [loading,setLoading]=useState(false);

  async function load(){
    if(!employeeId){ setRows([]); return; }
    setLoading(true);
    try{
      const qs=new URLSearchParams();
      qs.set("fields", JSON.stringify(["name","asset_name","item_name","serial_no","custodian","status"]));
      qs.set("filters", JSON.stringify([["Asset","custodian","=",employeeId]]));
      const res=await erpRequest(`api/resource/Asset?${qs.toString()}`);
      setRows(res?.data||[]);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ /* nop */ },[]);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs">Employee ID (Employee.name)</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={employeeId} onChange={e=>setEmployeeId(e.target.value)} placeholder="EMP-0001" />
      </div>
      <button className="px-3 py-2 border rounded-xl" onClick={load}>Load Assets</button>
      {loading && <div>Loading…</div>}
      <ul className="space-y-2">
        {rows.map(r=>(
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.asset_name || r.item_name || r.name}</div>
            <div className="text-xs text-gray-600">SN: {r.serial_no || "-"}</div>
            <div className="text-xs text-gray-600">Status: {r.status || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}