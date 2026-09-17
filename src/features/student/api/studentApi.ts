import { baseApi } from '@/store/baseApi';
import type { ManageGradesRequest, ManageGradesResponse, PerformancePrediction, Student, SubjectOption } from '../types/student.types';
import { manageGradesResponseSchema, predictionResponseSchema, studentResponseSchema, subjectOptionsSchema } from '../schema/student.schema';
export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudent: builder.query<Student, void>({ query: () => 'student/performance', transformResponse: (response: unknown) => studentResponseSchema.parse(response), providesTags: ['Student'] }),
    getSubjects: builder.query<SubjectOption[], void>({ query: () => 'student/subjects', transformResponse: (response: unknown) => subjectOptionsSchema.parse(response) }),
    manageGrades: builder.mutation<ManageGradesResponse, ManageGradesRequest>({ query: (body) => ({ url: 'student/grades/manage', method: 'POST', body }), transformResponse: (response: unknown) => manageGradesResponseSchema.parse(response), invalidatesTags: ['Student'] }),
    getPrediction: builder.query<PerformancePrediction, { studentId: number; year: number }>({ query: ({ studentId, year }) => `student/predict/${studentId}/${year}`, transformResponse: (response: unknown) => predictionResponseSchema.parse(response) })
  })
});
export const { useGetStudentQuery, useGetSubjectsQuery, useManageGradesMutation, useLazyGetPredictionQuery } = studentApi;
