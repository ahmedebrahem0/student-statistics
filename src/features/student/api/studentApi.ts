import { baseApi } from '@/store/baseApi';
import type { Student } from '../types/student.types';
import { studentResponseSchema } from '../schema/student.schema';
export const studentApi = baseApi.injectEndpoints({ endpoints: (builder) => ({ getStudent: builder.query<Student, void>({ query: () => 'student/performance', transformResponse: (response: unknown) => studentResponseSchema.parse(response) }) }) });
export const { useGetStudentQuery } = studentApi;
