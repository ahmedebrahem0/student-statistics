import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { essayGradeSchema, essayQuestionSchema } from "../schema/exam.schema";
import type { EssayGrade, EssayQuestion, GradeEssayRequest } from "../types/exam.types";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/student/exam", timeout: 15_000 }),
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
