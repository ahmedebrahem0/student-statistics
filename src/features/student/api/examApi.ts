import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  essayQuestionSchema,
  gradeEssayRequestSchema,
  upstreamEssayGradeSchema,
  upstreamEssayQuestionsSchema,
} from "../schema/exam.schema";
import type { EssayGrade, EssayQuestion, GradeEssayRequest } from "../types/exam.types";

export const examApi = createApi({
  reducerPath: "examApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.big-education-egypt.com/api/students/grade-answer/",
    timeout: 30_000,
  }),
  endpoints: (builder) => ({
    getEssayQuestion: builder.query<EssayQuestion, void>({
      query: () => ({ url: "", cache: "no-store" }),
      transformResponse: (response: unknown) => {
        const question = upstreamEssayQuestionsSchema.parse(response)[0];
        return essayQuestionSchema.parse({
          id: question.id,
          question: question.question,
          fullMark: question.full_mark,
        });
      },
    }),
    gradeEssay: builder.mutation<EssayGrade, GradeEssayRequest>({
      async queryFn(body, _api, _extraOptions, baseQuery) {
        const request = gradeEssayRequestSchema.safeParse(body);
        if (!request.success) {
          return { error: { status: "CUSTOM_ERROR", error: "??? ????? ????? ?????? ??????? ??? ???????." } };
        }
        const result = await baseQuery({
          url: "",
          method: "POST",
          body: {
            question_id: request.data.questionId,
            student_answer: request.data.studentAnswer,
          },
        });
        if (result.error) return { error: result.error };
        const grade = upstreamEssayGradeSchema.safeParse(result.data);
        if (!grade.success || grade.data.question_id !== request.data.questionId) {
          return { error: { status: "CUSTOM_ERROR", error: "???? ????? ??? ????? ?? ???? ???????." } };
        }
        const questionsResult = await baseQuery({ url: "", cache: "no-store" });
        if (questionsResult.error) return { error: questionsResult.error };
        const questions = upstreamEssayQuestionsSchema.safeParse(questionsResult.data);
        const question = questions.success
          ? questions.data.find((item) => item.id === grade.data.question_id)
          : undefined;
        if (!question) {
          return { error: { status: "CUSTOM_ERROR", error: "???? ????? ????? ??????? ??????." } };
        }
        return {
          data: {
            questionId: grade.data.question_id,
            score: grade.data.score,
            fullMark: grade.data.full_mark,
            modelAnswer: question.answer,
          },
        };
      },
    }),
  }),
});

export const { useGetEssayQuestionQuery, useGradeEssayMutation } = examApi;
