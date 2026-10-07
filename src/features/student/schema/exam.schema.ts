import { z } from "zod";

export const upstreamEssayQuestionSchema = z.object({
  id: z.number().int().positive(),
  question: z.string().trim().min(1),
  full_mark: z.literal(20),
  answer: z.string().trim().min(1),
});

export const upstreamEssayQuestionsSchema = z.array(upstreamEssayQuestionSchema).min(1);

export const essayQuestionSchema = z.object({
  id: z.number().int().positive(),
  question: z.string().trim().min(1),
  fullMark: z.literal(20),
});

export const gradeEssayRequestSchema = z.object({
  questionId: z.number().int().positive(),
  studentAnswer: z.string().trim().min(1),
});

export const upstreamEssayGradeSchema = z.object({
  question_id: z.number().int().positive(),
  score: z.number().min(0).max(20),
  full_mark: z.literal(20),
});

export const essayGradeSchema = z.object({
  questionId: z.number().int().positive(),
  score: z.number().min(0).max(20),
  fullMark: z.literal(20),
  modelAnswer: z.string().trim().min(1),
});
