import { z } from 'zod';
const scoreSchema = z.string().refine(value => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100, 'أدخل درجة من 0 إلى 100');
export const yearFormSchema = z.object({ academic_year_id: z.number().optional(), grades: z.array(z.object({ subject_id: z.number(), name: z.string(), score: scoreSchema })).min(1, 'أضف مادة واحدة على الأقل') });
export type YearFormValues = z.infer<typeof yearFormSchema>;
export const studentResponseSchema = z.object({ id: z.number(), student_name: z.string(), academic_years: z.array(z.object({ year_id: z.number(), year_label: z.string(), gpa: z.number().min(0).max(100), overall_rating: z.string(), subjects: z.array(z.object({ name: z.string(), score: scoreSchema, rating: z.string() })) })) });
export const studentPerformanceResponseSchema = z.object({
  student_id: z.number(),
  student_name: z.string(),
  history: z.array(z.object({
    year_id: z.number(),
    year_label: z.string(),
    gpa: z.number().min(0).max(100),
    subjects: z.array(z.object({
      subject_id: z.number(),
      subject_name: z.string(),
      score: z.number().min(0).max(100),
      rating: z.string()
    }))
  }))
});
export const subjectOptionsSchema = z.array(z.object({ id: z.number(), name: z.string() }));
export const manageGradesResponseSchema = z.object({ message: z.string(), data: studentResponseSchema });
export const predictionResponseSchema = z.object({ student_id: z.number(), student_name: z.string(), latest_recorded_year: z.number(), target_year: z.number(), predicted_gpa: z.number(), predictions: z.array(z.object({ subject_id: z.number(), subject_name: z.string(), predicted_score: z.number(), rating: z.string() })) });
export const predictYearSchema = z.string().regex(/^\d{4}$/, 'اكتب سنة صحيحة مكونة من 4 أرقام').refine(value => Number(value) >= 2000 && Number(value) <= 2100, 'أدخل سنة منطقية');
