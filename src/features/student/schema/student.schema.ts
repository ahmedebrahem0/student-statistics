import { z } from 'zod';
const scoreSchema = z.string().refine(value => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100, 'أدخل درجة من 0 إلى 100');
export const yearFormSchema = z.object({ year_label: z.string().regex(/^\d{4}-\d{4}$/, 'اكتب السنة بهذا الشكل: 2025-2026').refine(value => Number(value.slice(5)) === Number(value.slice(0, 4)) + 1, 'السنة الثانية يجب أن تلي السنة الأولى'), subjects: z.array(z.object({ name: z.string().trim().min(2, 'أدخل اسم المادة'), score: scoreSchema })).min(1, 'أضف مادة واحدة على الأقل') });
export type YearFormValues = z.infer<typeof yearFormSchema>;
export const studentResponseSchema = z.object({ id: z.number(), student_name: z.string(), academic_years: z.array(z.object({ year_id: z.number(), year_label: z.string(), gpa: z.number().min(0).max(100), overall_rating: z.string(), subjects: z.array(z.object({ name: z.string(), score: scoreSchema, rating: z.string() })) })) });
