import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  mode: 'session' | 'token';
  apiKey?: string;
  apiSecret?: string;
  loggedIn: boolean;
}

const initialState: AuthState = {
  mode: (import.meta as any).env.VITE_AUTH_METHOD?.toLowerCase?.() || 'session',
  loggedIn: false,
  apiKey: (import.meta as any).env.VITE_API_KEY,
  apiSecret: (import.meta as any).env.VITE_API_SECRET,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<'session' | 'token'>) {
      state.mode = action.payload;
    },
    setTokenCreds(state, action: PayloadAction<{ apiKey: string; apiSecret: string }>) {
      state.apiKey = action.payload.apiKey;
      state.apiSecret = action.payload.apiSecret;
    },
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.loggedIn = action.payload;
    },
    logout(state) {
      state.loggedIn = false;
    },
  },
});

export const { setMode, setTokenCreds, setLoggedIn, logout } = slice.actions;
export default slice.reducer;