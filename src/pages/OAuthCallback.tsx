import { useEffect, useState } from "react";
import { exchangeCodeForToken, setAccessToken, getOpenIdProfile } from "../lib/erp-oauth";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = String(import.meta.env.VITE_OAUTH_CLIENT_ID || "");
const REDIRECT_URI = String(import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/auth/callback");

export default function OAuthCallback() {
  const nav = useNavigate();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");
        if (error) throw new Error(error);
        if (!code) throw new Error("Missing authorization code");

        const code_verifier = sessionStorage.getItem("pkce_verifier") || "";
        const tok = await exchangeCodeForToken({ code, code_verifier, client_id: CLIENT_ID, redirect_uri: REDIRECT_URI });

        setAccessToken(tok.access_token);
        // Optional: store refresh_token securely (avoid localStorage in SPA; prefer a tiny backend if you need long sessions)
        // e.g., sessionStorage.setItem("refresh_token", tok.refresh_token);

        // Optional: fetch profile
        await getOpenIdProfile().catch(() => null);

        nav("/home", { replace: true });
      } catch (e: any) {
        setErr(e.message || String(e));
      }
    })();
  }, [nav]);

  return <div className="p-6 text-sm">{err ? `OAuth error: ${err}` : "Signing you in…"}</div>;
}