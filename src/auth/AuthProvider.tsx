// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  loadAccessTokenFromStorage,
  isAuthenticated,
  onAuthChange,
  getOpenIdProfile,
  logoutLocal,
  buildAuthorizeUrl,
  CLIENT_ID,
  REDIRECT_URI,
} from "../lib/erp-oauth";
import { makePkcePair } from "../lib/pkce";

type AuthCtx = {
  authed: boolean;
  user: string | null;     // best-effort (from OpenID profile if scope=openid)
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Boot: load token from storage, set auth, fetch profile (best-effort)
  useEffect(() => {
    loadAccessTokenFromStorage();
    const ok = isAuthenticated();
    setAuthed(ok);
    (async () => {
      if (ok) {
        const profile = await getOpenIdProfile().catch(() => null);
        // ERPNext openid_profile typically returns { message: { name, email, ... } }
        const name = profile?.message?.full_name || profile?.message?.name || profile?.message?.email;
        if (name) setUser(String(name));
      }
      setLoading(false);
    })();

    // Live updates: when token changes (login/logout/refresh), update UI
    const off = onAuthChange(async () => {
      const ok2 = isAuthenticated();
      setAuthed(ok2);
      if (ok2) {
        const profile = await getOpenIdProfile().catch(() => null);
        const name = profile?.message?.full_name || profile?.message?.name || profile?.message?.email;
        setUser(name ? String(name) : null);
      } else {
        setUser(null);
      }
    });

    // Also react to other tabs changing tokens
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        const ok3 = isAuthenticated();
        setAuthed(ok3);
        if (!ok3) setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      off();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Starts OAuth Authorization Code + PKCE in-browser (redirect)
  async function login() {
    const { verifier, challenge } = await makePkcePair();
    sessionStorage.setItem("pkce_verifier", verifier);
    const state = crypto.randomUUID();
    const url = buildAuthorizeUrl({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid all", // adjust to your scopes
      code_challenge: challenge,
      state,
    });
    window.location.href = url;
  }

  function logout() {
    logoutLocal(); // clears tokens + notifies subscribers
    // you can navigate("/login") in components after calling logout()
  }

  return (
    <Ctx.Provider value={{ authed, user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within <AuthProvider>");
  return v;
}