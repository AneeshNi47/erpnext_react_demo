import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useListAssetsQuery } from '../../assets/assetsApi';

export default function AssetList() {
  const [search, setSearch] = useState('');
  const { data, isFetching, refetch } = useListAssetsQuery({ search });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="px-3 py-2 rounded-xl border" onClick={() => refetch()}>Search</button>
        <Link to="/assets/new" className="px-3 py-2 rounded-xl bg-black text-white">New Asset</Link>
      </div>
      {isFetching && <div className="text-sm text-gray-600">Loading…</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data?.map(a => (
          <Link key={a.name} to={`/assets/${a.name}`} className="rounded-2xl border bg-white p-4 hover:shadow">
            <div className="font-semibold">{a.item_name || a.asset_name || a.name}</div>
            <div className="text-xs text-gray-600">Name: {a.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}