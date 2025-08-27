import React from "react";
import { makePkcePair } from "../lib/pkce";

const ERP_BASE = String(import.meta.env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
const CLIENT_ID = String(import.meta.env.VITE_OAUTH_CLIENT_ID || "");
const REDIRECT_URI = String(import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/auth/callback");
const SCOPE = "openid all"; // tweak as needed

export default function LoginWithOAuth() {
  async function go() {
    const { verifier, challenge } = await makePkcePair();
    sessionStorage.setItem("pkce_verifier", verifier);
    const qs = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      scope: SCOPE,
      redirect_uri: REDIRECT_URI,
      code_challenge_method: "S256",
      code_challenge: challenge,
      state: crypto.randomUUID(),
    });
    // ERPNext authorize endpoint
    window.location.href = `${ERP_BASE}/api/method/frappe.integrations.oauth2.authorize?${qs}`;
  }

  return (
    <div className="p-6">
      <button className="px-4 py-2 rounded bg-black text-white" onClick={go}>
        Sign in with ERPNext
      </button>
    </div>
  );
}