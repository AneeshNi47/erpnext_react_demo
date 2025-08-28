import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logoutLocal, getOpenIdProfile, onAuthChange } from "../lib/erp-oauth";

export default function Header() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  // react to auth changes (login/logout/refresh)
  useEffect(() => {
    const off = onAuthChange(() => {
      const ok = isAuthenticated();
      setAuthed(ok);
      if (!ok) setUsername(null);
    });

    // also react to cross-tab token changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === "refresh_token") {
        const ok = isAuthenticated();
        setAuthed(ok);
        if (!ok) setUsername(null);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      off();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // load profile when authed flips to true
  useEffect(() => {
    (async () => {
      if (authed) {
        const profile = await getOpenIdProfile().catch(() => null);
        if (profile?.message?.name) setUsername(profile.message.name);
      }
    })();
  }, [authed]);

  function handleLogout() {
    logoutLocal();               // clears tokens + triggers onAuthChange
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">ERPNext React</Link>

        {authed && (
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/home">Home</Link>
            <Link to="/list/branches">Branches</Link>
            <Link to="/list/departments">Departments</Link>
            <Link to="/list/employees">Employees</Link>
            <Link to="/list/items">Items</Link>
            <Link to="/list/assets">Assets</Link>
          </nav>
        )}

        <div className="text-sm flex items-center gap-3">
          {authed ? (
            <>
              {username && <span className="text-gray-700">Hi, {username}</span>}
              <button className="px-2 py-1 rounded border" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}