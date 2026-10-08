import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export const baseApi = createApi({ reducerPath: 'api', baseQuery: fetchBaseQuery({ baseUrl: `${STUDENT_API_BASE_URL}/`, timeout: 20000 }), tagTypes: ['Student','Teacher'], endpoints: () => ({}) });
