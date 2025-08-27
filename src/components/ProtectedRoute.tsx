// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../lib/erp-oauth";

export default function ProtectedRoute() {
  const loc = useLocation();
  const authed = isAuthenticated(); // true if access_token exists

  // no async check needed with OAuth tokens stored in sessionStorage
  if (!authed) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}