import React, { useEffect, useState } from 'react';
import { useLoginMutation, useWhoamiQuery } from '../authApi';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setLoggedIn, setMode, setTokenCreds } from '../authSlice';

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(s => s.auth.mode);
  const [usr, setUsr] = useState('');
  const [pwd, setPwd] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const { data: who } = useWhoamiQuery();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => { if (who?.message) dispatch(setLoggedIn(true)); }, [who, dispatch]);

  async function onSessionLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await login({ usr, pwd }).unwrap();
    if (res?.message) dispatch(setLoggedIn(true));
  }

  function onTokenSave(e: React.FormEvent) {
    e.preventDefault();
    dispatch(setTokenCreds({ apiKey, apiSecret }));
    dispatch(setLoggedIn(true)); // we consider token present as logged in for routing purposes
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <select
          value={mode}
          onChange={(e) => dispatch(setMode(e.target.value as any))}
          className="border rounded-lg px-2 py-1 text-sm"
        >
          <option value="session">Session (username/password)</option>
          <option value="token">API Token (key/secret)</option>
        </select>
      </div>

      {mode === 'session' ? (
        <form onSubmit={onSessionLogin} className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Username</label>
            <input className="w-full border rounded-lg px-3 py-2" value={usr} onChange={e=>setUsr(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2" value={pwd} onChange={e=>setPwd(e.target.value)} />
          </div>
          <button className="w-full bg-black text-white rounded-xl py-2" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={onTokenSave} className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">API Key</label>
            <input className="w-full border rounded-lg px-3 py-2" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">API Secret</label>
            <input className="w-full border rounded-lg px-3 py-2" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} />
          </div>
          <button className="w-full bg-black text-white rounded-xl py-2">Use Token</button>
        </form>
      )}

      <p className="text-xs text-gray-500">Make sure your ERPNext allows CORS for this app’s origin.</p>
    </div>
  );
}