import { baseApi } from '@/store/baseApi';
import { teacherComparisonSchema, teacherDetailSchema } from '../schema/teacher.schema';
import type { TeacherComparison, TeacherDetail } from '../types/teacher.types';
export const teacherApi = baseApi.injectEndpoints({ endpoints: builder => ({
  getTeachers: builder.query<TeacherComparison[], void>({ query: () => 'teachers/compare', transformResponse: (response: unknown) => teacherComparisonSchema.parse(response), providesTags: ['Teacher'] }),
  getTeacher: builder.query<TeacherDetail, number>({ query: id => `teachers/${id}`, transformResponse: (response: unknown) => teacherDetailSchema.parse(response), providesTags: (_result, _error, id) => [{ type: 'Teacher', id }] })
}) });
export const { useGetTeachersQuery, useGetTeacherQuery } = teacherApi;
