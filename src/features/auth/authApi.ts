import { createApi } from '@reduxjs/toolkit/query/react';
import { erpBaseQuery } from '../../lib/erpBaseQuery';
import type { ERPUser } from '../../lib/types';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: erpBaseQuery,
  endpoints: (builder) => ({
    whoami: builder.query<ERPUser, void>({
      query: () => ({ url: 'api/method/frappe.auth.get_logged_user', method: 'GET' }),
    }),
    login: builder.mutation<{ message: string }, { usr: string; pwd: string }>({
      query: (body) => ({ url: 'api/method/login', method: 'POST', body }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: 'api/method/logout', method: 'GET' }),
    }),
  })
});

export const { useWhoamiQuery, useLoginMutation, useLogoutMutation } = authApi;
