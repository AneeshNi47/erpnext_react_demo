// src/lib/erp-oauth.ts
// OAuth2 (PKCE) client for ERPNext — cookie-less, Bearer token auth.

export const BASE = String(import.meta.env.VITE_ERP_BASE_URL || "").replace(/\/$/, "");
export const CLIENT_ID = String(import.meta.env.VITE_OAUTH_CLIENT_ID || "");
export const REDIRECT_URI = String(import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/auth/callback");

// ----- Auth change broadcaster -----
type AuthListener = () => void;
const authListeners = new Set<AuthListener>();
function notifyAuth() { for (const fn of [...authListeners]) { try { fn(); } catch {} } }
export function onAuthChange(fn: AuthListener) { authListeners.add(fn); return () => authListeners.delete(fn); }

// ----- Token storage (memory + sessionStorage) -----
let accessTokenMem: string | null = null;
let refreshTokenMem: string | null = null;
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function setAccessToken(tok: string | null, refreshTok?: string | null) {
  accessTokenMem = tok;
  if (tok) sessionStorage.setItem(ACCESS_KEY, tok);
  else sessionStorage.removeItem(ACCESS_KEY);

  if (typeof refreshTok !== "undefined") {
    refreshTokenMem = refreshTok;
    if (refreshTok) sessionStorage.setItem(REFRESH_KEY, refreshTok);
    else sessionStorage.removeItem(REFRESH_KEY);
  }
  notifyAuth();
}

export function loadAccessTokenFromStorage() {
  accessTokenMem = sessionStorage.getItem(ACCESS_KEY);
  refreshTokenMem = sessionStorage.getItem(REFRESH_KEY);
}

export function getAccessToken() {
  return accessTokenMem || sessionStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken() {
  return refreshTokenMem || sessionStorage.getItem(REFRESH_KEY);
}
export function isAuthenticated() {
  return !!getAccessToken();
}
export function logoutLocal() {
  setAccessToken(null, null);
  // setAccessToken already notifies
}

// ----- Low-level helpers -----
async function parseJsonSafe(res: Response) { try { return await res.json(); } catch { return {}; } }
function pickErrMsg(j: any, fallback: string) {
  return j?.error_description || j?.error || j?.message || j?._server_messages || j?.exception || fallback;
}

// ----- Bearer fetch with 401 -> one-time refresh retry -----
export async function erpFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const tok = getAccessToken();
  if (tok && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${tok}`);

  const doFetch = () => fetch(`${BASE}/${path.replace(/^\/+/, "")}`, { ...init, headers });

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const headers2 = new Headers(init.headers || {});
      if (init.body && !headers2.has("Content-Type")) headers2.set("Content-Type", "application/json");
      const tok2 = getAccessToken();
      if (tok2) headers2.set("Authorization", `Bearer ${tok2}`);
      res = await fetch(`${BASE}/${path.replace(/^\/+/, "")}`, { ...init, headers: headers2 });
    }
  }

  const json = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(json, res.statusText));
  return json;
}

// ----- ERPNext OAuth endpoints -----
const AUTHZ_PATH = "/api/method/frappe.integrations.oauth2.authorize";
const TOKEN_PATH = "/api/method/frappe.integrations.oauth2.get_token";
const OPENID_PROFILE_PATH = "/api/method/frappe.integrations.oauth2.openid_profile";

// Build authorize URL (use with your PKCE challenge)
export function buildAuthorizeUrl(params: {
  client_id?: string;
  redirect_uri?: string;
  scope?: string;          // e.g. "openid all"
  code_challenge: string;
  state?: string;
}) {
  const qs = new URLSearchParams({
    response_type: "code",
    client_id: params.client_id || CLIENT_ID,
    redirect_uri: params.redirect_uri || REDIRECT_URI,
    scope: params.scope || "openid all",
    code_challenge_method: "S256", // important: capital S
    code_challenge: params.code_challenge,
  });
  if (params.state) qs.set("state", params.state);
  return `${BASE}${AUTHZ_PATH}?${qs.toString()}`;
}

// Exchange authorization code (PKCE) for tokens
export async function exchangeCodeForToken(args: {
  code: string;
  code_verifier: string;
  client_id?: string;
  redirect_uri?: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: args.code,
    client_id: args.client_id || CLIENT_ID,
    redirect_uri: args.redirect_uri || REDIRECT_URI,
    code_verifier: args.code_verifier,
  });

  const res = await fetch(`${BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(j, "Token exchange failed"));

  // j: { access_token, token_type, expires_in, refresh_token?, scope, id_token? }
  setAccessToken(j.access_token, j.refresh_token ?? undefined);
  return j as {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    id_token?: string;
  };
}

// Optional: refresh token flow
export async function refreshAccessToken() {
  const rt = getRefreshToken();
  if (!rt) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rt,
    client_id: CLIENT_ID,
  });

  const res = await fetch(`${BASE}${TOKEN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const j = await parseJsonSafe(res);
  if (!res.ok) throw new Error(pickErrMsg(j, "Token refresh failed"));

  setAccessToken(j.access_token, j.refresh_token ?? undefined);
  return j.access_token as string;
}

async function tryRefresh() {
  try {
    const tok = await refreshAccessToken();
    return !!tok;
  } catch {
    logoutLocal();
    return false;
  }
}

// Optional: OpenID user profile (requires `openid` scope)
export async function getOpenIdProfile() {
  const tok = getAccessToken();
  const headers: HeadersInit = tok ? { Authorization: `Bearer ${tok}` } : {};
  const res = await fetch(`${BASE}${OPENID_PROFILE_PATH}`, { headers });
  if (!res.ok) return null;
  return parseJsonSafe(res);
}