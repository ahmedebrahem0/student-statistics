import { z } from 'zod';
const ratingSchema = z.enum(['Excellent', 'Very Good', 'Good', 'Pass', 'Fail']);
const scoreSchema = z.number().min(0).max(100);
export const teacherComparisonSchema = z.array(z.object({
  id: z.number().int(), name: z.string().min(1), is_general: z.boolean(), subject: z.string().min(1),
  yearly_performance: z.array(z.object({ year_id: z.number().int(), year_label: z.string().min(1), avg_score: scoreSchema, rating: ratingSchema, students_count: z.number().int().nonnegative() }))
}));
export const teacherDetailSchema = z.object({
  id: z.number().int(), name: z.string().min(1), is_general: z.boolean(), subject: z.string().min(1), overall_performance: scoreSchema, total_students: z.number().int().nonnegative(),
  students: z.array(z.object({ student_id: z.number().int(), student_name: z.string().min(1), chart_data: z.array(z.object({ year: z.string().min(1), gpa: scoreSchema, rating: ratingSchema })) }))
});
