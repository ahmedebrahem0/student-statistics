import { baseApi } from '@/store/baseApi';
import type { ManageGradesRequest, ManageGradesResponse, PerformancePrediction, Student, StudentComparison, StudentReport, SubjectOption } from '../types/student.types';
import { manageGradesResponseSchema, predictionResponseSchema, studentComparisonSchema, studentPerformanceResponseSchema, studentReportSchema, studentResponseSchema, subjectOptionsSchema } from '../schema/student.schema';
import { ratingFor } from '../utils/student.utils';
function parseStudentPerformance(response: unknown): Student {
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
}
export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentsComparison: builder.query<StudentComparison[], void>({
      query: () => 'students/students/compare',
      transformResponse: (response: unknown) => studentComparisonSchema.parse(response),
      providesTags: ['Student']
    }),
    getStudent: builder.query<Student, void>({
      query: () => 'student/performance',
      transformResponse: (response: unknown) => parseStudentPerformance(response),
      providesTags: ['Student']
    }),
    getStudentById: builder.query<Student, number>({
      query: (studentId) => `students/students/${studentId}/performance`,
      transformResponse: (response: unknown) => parseStudentPerformance(response),
      providesTags: (_result, _error, studentId) => [{ type: 'Student', id: studentId }]
    }),
    getSubjects: builder.query<SubjectOption[], void>
      ({
        query: () => 'students/subjects',
        transformResponse: (response: unknown) => subjectOptionsSchema.parse(response)
      }),
    manageGrades: builder.mutation<ManageGradesResponse, ManageGradesRequest>
      ({
        query: (body) => ({
          url: 'students/grades/manage',
          method: 'POST', body
        }), transformResponse: (response: unknown): ManageGradesResponse => {
          const parsed = manageGradesResponseSchema.parse(response);
          return { message: parsed.message, data: parseStudentPerformance(parsed.data) };
        }, invalidatesTags: ['Student']
      }),
    getPrediction: builder.query<PerformancePrediction, { studentId: number; year: number }>({ query: ({ studentId, year }) => `students/students/${studentId}/predict/${year}`, transformResponse: (response: unknown) => predictionResponseSchema.parse(response) }),
    getStudentReport: builder.query<StudentReport, number>({ query: (studentId) => ({ url: `students/reports/students/${studentId}`, timeout: 90000 }), transformResponse: (response: unknown) => studentReportSchema.parse(response) })
  })
});
export const { useGetStudentsComparisonQuery, useGetStudentQuery, useGetStudentByIdQuery, useGetSubjectsQuery, useManageGradesMutation, useLazyGetPredictionQuery, useLazyGetStudentReportQuery } = studentApi;
