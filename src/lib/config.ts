import type { EnvConfig } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env || {};

export const config: EnvConfig = {
  baseUrl: String(env.VITE_ERP_BASE_URL || '').replace(/\/$/, ''),
  authMethod: (env.VITE_AUTH_METHOD || 'session').toLowerCase(),
  apiKey: env.VITE_API_KEY,
  apiSecret: env.VITE_API_SECRET,
} as EnvConfig;

export function assertBaseUrl() {
  if (!config.baseUrl) throw new Error('VITE_ERP_BASE_URL is not set');
}