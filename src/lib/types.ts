export type AuthMode = 'session' | 'token';

export interface EnvConfig {
  baseUrl: string;           // e.g. https://your-erp.site
  authMethod: AuthMode;      // 'session' | 'token'
  apiKey?: string;           // for token mode
  apiSecret?: string;        // for token mode
}

export type ERPUser = { message?: string } | null;

export type Asset = {
  name?: string;
  item_name?: string;
  asset_name?: string;
  status?: string;
  purchase_date?: string;
  location?: string;
  gross_purchase_amount?: number;
  supplier?: string;
  company?: string;
  [key: string]: unknown;
};