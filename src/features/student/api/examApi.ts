import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { essayGradeSchema, essayQuestionSchema } from "../schema/exam.schema";
import type { EssayGrade, EssayQuestion, GradeEssayRequest } from "../types/exam.types";

export const examApi = createApi({
  reducerPath: "examApi",
  // This local route forwards requests to the grading API and adapts its response.
  // Grading can make two upstream requests, each with a 12-second timeout.
  baseQuery: fetchBaseQuery({ baseUrl: "/api/students/grade-answer/", timeout: 30_000 }),
  endpoints: (builder) => ({
    getEssayQuestion: builder.query<EssayQuestion, void>({
      query: () => ({ url: "", cache: "no-store" }),
      transformResponse: (response: unknown) => essayQuestionSchema.parse(response),
    }),
    gradeEssay: builder.mutation<EssayGrade, GradeEssayRequest>({
      query: (body) => ({ url: "", method: "POST", body }),
      transformResponse: (response: unknown) => essayGradeSchema.parse(response),
    }),
  }),
});

export const { useGetEssayQuestionQuery, useGradeEssayMutation } = examApi;

// https://big-education-egypt.com/api/student/exam
// https://api.big-education-egypt.com/api/students/grade-answer/