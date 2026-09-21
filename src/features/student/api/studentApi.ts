import { baseApi } from '@/store/baseApi';
import type { ManageGradesRequest, ManageGradesResponse, PerformancePrediction, Student, SubjectOption } from '../types/student.types';
import { manageGradesResponseSchema, predictionResponseSchema, studentPerformanceResponseSchema, studentResponseSchema, subjectOptionsSchema } from '../schema/student.schema';
import { ratingFor } from '../utils/student.utils';
export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudent: builder.query<Student, void>({
      query: () => 'student/performance',
      transformResponse: (response: unknown) => {
        const legacy = studentResponseSchema.safeParse(response);
        if (legacy.success) return legacy.data;
        const performance = studentPerformanceResponseSchema.parse(response);
        return {
          id: performance.student_id,
          student_name: performance.student_name,
          academic_years: performance.history.map(year => ({
            year_id: year.year_id,
            year_label: year.year_label,
            gpa: year.gpa,
            overall_rating: ratingFor(year.gpa),
            subjects: year.subjects.map(subject => ({
              name: subject.subject_name,
              score: String(subject.score),
              rating: subject.rating
            }))
          }))
        };
      }, providesTags: ['Student']
    }),
    getSubjects: builder.query<SubjectOption[], void>
      ({
        query: () => 'student/subjects',
        transformResponse: (response: unknown) => subjectOptionsSchema.parse(response)
      }),
    manageGrades: builder.mutation<ManageGradesResponse, ManageGradesRequest>
      ({
        query: (body) => ({
          url: 'student/grades/manage',
          method: 'POST', body
        }), transformResponse: (response: unknown) => manageGradesResponseSchema.parse(response), invalidatesTags: ['Student']
      }),
    getPrediction: builder.query<PerformancePrediction, { studentId: number; year: number }>({ query: ({ studentId, year }) => `student/predict/${studentId}/${year}`, transformResponse: (response: unknown) => predictionResponseSchema.parse(response) })
  })
});
export const { useGetStudentQuery, useGetSubjectsQuery, useManageGradesMutation, useLazyGetPredictionQuery } = studentApi;
