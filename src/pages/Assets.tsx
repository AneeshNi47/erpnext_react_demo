import React from 'react';
import Layout from '../components/Layout';
import AssetList from '../features/assets/components/AssetList';
import AssetDetail from '../features/assets/components/AssetDetail';
import AssetCreate from '../features/assets/components/AssetCreate';
import { Routes, Route, Link } from 'react-router-dom';

export default function AssetsPage() {
  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assets</h1>
        <Link to="/assets/new" className="text-sm underline">Create</Link>
      </div>
      <Routes>
        <Route index element={<AssetList />} />
        <Route path="new" element={<AssetCreate />} />
        <Route path=":name" element={<AssetDetail />} />
      </Routes>
    </Layout>
  );
}