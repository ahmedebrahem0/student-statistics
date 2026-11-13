import { createApi } from '@reduxjs/toolkit/query/react';
import { smartBaseQuery } from './smartBaseQuery';
export const baseApi = createApi({ reducerPath: 'api', baseQuery: smartBaseQuery({ timeout: 20000 }), tagTypes: ['Student','Teacher'], endpoints: () => ({}) });
