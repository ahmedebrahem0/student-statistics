import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import { examApi } from '@/features/student/api/examApi';
export const makeStore = () => configureStore({ reducer: { [baseApi.reducerPath]: baseApi.reducer, [examApi.reducerPath]: examApi.reducer }, middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware, examApi.middleware) });
export type AppStore = ReturnType<typeof makeStore>;
