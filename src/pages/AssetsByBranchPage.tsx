import React, { useState } from "react";
const erpRequest=(p:string,i:RequestInit={})=>{
  const e:any=(import.meta as any).env||{},b=String(e.VITE_ERP_BASE_URL||"").replace(/\/$/,""),
        a=(e.VITE_AUTH_METHOD||"session").toLowerCase(),h:any={};
  if(a==="token"&&e.VITE_API_KEY&&e.VITE_API_SECRET) h.Authorization=`token ${e.VITE_API_KEY}:${e.VITE_API_SECRET}`;
  return fetch(`${b}/${p}`,{...i,headers:{"Content-Type":"application/json",...h,...(i.headers as any)},credentials:a==="session"?"include":"same-origin"}).then(async r=>{const j=await r.json().catch(()=>({})); if(!r.ok) throw new Error(j?._server_messages||j?.exception||r.statusText); return j;});
};

export default function AssetsByBranchPage(){
  const [branch,setBranch]=useState(""); // Branch.name
  const [rows,setRows]=useState<any[]>([]); const [loading,setLoading]=useState(false);

  async function load(){
    if(!branch){ setRows([]); return; }
    setLoading(true);
    try{
      // 1) employees in branch
      const q1=new URLSearchParams();
      q1.set("fields", JSON.stringify(["name"]));
      q1.set("filters", JSON.stringify([["Employee","branch","=",branch]]));
      const emp=await erpRequest(`api/resource/Employee?${q1.toString()}`);
      const ids=(emp?.data||[]).map((e:any)=>e.name);
      if(ids.length===0){ setRows([]); setLoading(false); return; }

      // 2) assets by custodian IN employees
      const q2=new URLSearchParams();
      q2.set("fields", JSON.stringify(["name","asset_name","item_name","serial_no","custodian","status"]));
      q2.set("filters", JSON.stringify([["Asset","custodian","in",ids]]));
      const assets=await erpRequest(`api/resource/Asset?${q2.toString()}`);
      setRows(assets?.data||[]);
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs">Branch ID (Branch.name)</label>
        <input className="border rounded-xl px-3 py-2 w-full" value={branch} onChange={e=>setBranch(e.target.value)} placeholder="BR-001" />
      </div>
      <button className="px-3 py-2 border rounded-xl" onClick={load}>Load Assets</button>
      {loading && <div>Loading…</div>}
      <ul className="space-y-2">
        {rows.map(r=>(
          <li key={r.name} className="border rounded-xl bg-white p-3">
            <div className="font-medium">{r.asset_name || r.item_name || r.name}</div>
            <div className="text-xs text-gray-600">SN: {r.serial_no || "-"}</div>
            <div className="text-xs text-gray-600">Custodian: {r.custodian || "-"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}