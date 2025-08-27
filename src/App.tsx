// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import LoginWithOAuth from "./pages/LoginWithOAuth";
import OAuthCallback from "./pages/OAuthCallback";
import HomePage from "./pages/HomePage";
// your list/create pages
import BranchListPage from "./pages/BranchListPage";
import DepartmentListPage from "./pages/DepartmentListPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import ItemListPage from "./pages/ItemListPage";
import AssetListPage from "./pages/AssetListPage";
import AssetsByEmployeePage from "./pages/AssetsByEmployeePage";
import AssetsByDepartmentPage from "./pages/AssetsByDepartmentPage";
import AssetsByBranchPage from "./pages/AssetsByBranchPage";

export default function App() {
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/login" element={<LoginWithOAuth />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/list/branches" element={<BranchListPage />} />
            <Route path="/list/departments" element={<DepartmentListPage />} />
            <Route path="/list/employees" element={<EmployeeListPage />} />
            <Route path="/list/items" element={<ItemListPage />} />
            <Route path="/list/assets" element={<AssetListPage />} />
            <Route path="/assets/by-employee" element={<AssetsByEmployeePage />} />
            <Route path="/assets/by-department" element={<AssetsByDepartmentPage />} />
            <Route path="/assets/by-branch" element={<AssetsByBranchPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}