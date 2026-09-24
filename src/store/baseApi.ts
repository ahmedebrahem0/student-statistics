import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const baseApi = createApi({ reducerPath: 'api', baseQuery: fetchBaseQuery({ baseUrl: 'https://api.big-education-egypt.com/api/', timeout: 20000 }), tagTypes: ['Student','Teacher'], endpoints: () => ({}) });
