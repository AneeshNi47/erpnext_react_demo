import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeleteAssetMutation, useGetAssetQuery } from '../../assets/assetsApi';

export default function AssetDetail() {
  const { name = '' } = useParams();
  const nav = useNavigate();
  const { data, isFetching } = useGetAssetQuery(name);
  const [del, { isLoading }] = useDeleteAssetMutation();

  async function onDelete() {
    if (!confirm('Delete this asset?')) return;
    await del(name).unwrap();
    nav('/assets');
  }

  if (isFetching) return <div>Loading…</div>;
  if (!data) return <div>Not found</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{data.item_name || data.asset_name || data.name}</h2>
        <button onClick={onDelete} className="px-3 py-2 rounded-xl bg-red-600 text-white" disabled={isLoading}>Delete</button>
      </div>
      <pre className="bg-white rounded-xl border p-4 overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}