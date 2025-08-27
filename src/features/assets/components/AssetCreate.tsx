import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateAssetMutation } from '../../assets/assetsApi';
import type { Asset } from '../../../lib/types';

export default function AssetCreate() {
  const nav = useNavigate();
  const [create, { isLoading }] = useCreateAssetMutation();
  const [doc, setDoc] = useState<Asset>({ item_name: '', status: 'Draft', purchase_date: new Date().toISOString().slice(0,10) });

  function set<K extends keyof Asset>(k: K, v: Asset[K]) { setDoc(prev => ({ ...prev, [k]: v })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...doc };
    if (!payload.asset_name && payload.item_name) payload.asset_name = payload.item_name;
    const res = await create(payload).unwrap();
    nav(`/assets/${res.name}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-gray-600">Item Name</label>
        <input className="w-full border rounded-xl px-3 py-2" value={doc.item_name || ''} onChange={e=>set('item_name', e.target.value)} required />
      </div>
      <div>
        <label className="text-xs text-gray-600">Status</label>
        <input className="w-full border rounded-xl px-3 py-2" value={doc.status || ''} onChange={e=>set('status', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-gray-600">Purchase Date</label>
        <input type="date" className="w-full border rounded-xl px-3 py-2" value={doc.purchase_date || ''} onChange={e=>set('purchase_date', e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-gray-600">Company</label>
        <input className="w-full border rounded-xl px-3 py-2" value={doc.company || ''} onChange={e=>set('company', e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <button className="px-4 py-2 rounded-xl bg-black text-white" disabled={isLoading}>{isLoading ? 'Creating…' : 'Create Asset'}</button>
      </div>
    </form>
  );
}