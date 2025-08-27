import { createApi } from '@reduxjs/toolkit/query/react';
import { erpBaseQuery } from '../../lib/erpBaseQuery';
import type { Asset } from '../../lib/types';

export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: erpBaseQuery,
  tagTypes: ['Asset'],
  endpoints: (b) => ({
    listAssets: b.query<Asset[], { search?: string } | void>({
      query: (args) => {
        const search = args?.search || '';
        const params = new URLSearchParams();
        params.set('fields', JSON.stringify(['name','item_name','asset_name','status','purchase_date']));
        if (search) params.set('filters', JSON.stringify([["Asset","item_name","like",`%${search}%`]]));
        return { url: `api/resource/Asset?${params.toString()}`, method: 'GET' };
      },
      providesTags: (result) => result ? [...result.map(a => ({ type: 'Asset' as const, id: a.name })), { type: 'Asset', id: 'LIST' }] : [{ type: 'Asset', id: 'LIST' }]
    }),
    getAsset: b.query<Asset, string>({
      query: (name) => ({ url: `api/resource/Asset/${encodeURIComponent(name)}`, method: 'GET' }),
      providesTags: (_res, _err, name) => [{ type: 'Asset', id: name }]
    }),
    createAsset: b.mutation<Asset, Partial<Asset>>({
      query: (body) => ({ url: 'api/resource/Asset', method: 'POST', body }),
      invalidatesTags: [{ type: 'Asset', id: 'LIST' }]
    }),
    deleteAsset: b.mutation<{ ok: true }, string>({
      query: (name) => ({ url: `api/resource/Asset/${encodeURIComponent(name)}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, name) => [{ type: 'Asset', id: name }, { type: 'Asset', id: 'LIST' }]
    }),
  })
});

export const { useListAssetsQuery, useGetAssetQuery, useCreateAssetMutation, useDeleteAssetMutation } = assetsApi;
