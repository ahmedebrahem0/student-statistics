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
export const manageGradesResponseSchema = z.object({ message: z.string(), data: z.unknown() });
export const predictionResponseSchema = z.object({ student_id: z.number(), student_name: z.string(), latest_recorded_year: z.number(), target_year: z.number(), predicted_gpa: z.number(), predictions: z.array(z.object({ subject_id: z.number(), subject_name: z.string(), predicted_score: z.number(), rating: z.string() })) });
export const predictYearSchema = z.string().regex(/^\d{4}$/, 'اكتب سنة صحيحة مكونة من 4 أرقام').refine(value => Number(value) >= 2000 && Number(value) <= 2100, 'أدخل سنة منطقية');
const comparisonScoreSchema = z.number().min(0).max(100);
export const studentComparisonSchema = z.array(z.object({
  student_id: z.number().int().positive(),
  student_name: z.string().min(1),
  overall_gpa: comparisonScoreSchema,
  overall_rating: z.string().min(1),
  yearly_performance: z.array(z.object({
    year_id: z.number().int().positive(),
    year_label: z.string().min(1),
    gpa: comparisonScoreSchema,
    rating: z.string().min(1)
  }))
}));
export const studentReportSchema = z.object({
  analytics_data: z.object({
    student_id: z.number(),
    student_name: z.string(),
    teachers: z.array(z.object({ name: z.string(), subject: z.string() })),
    yearly_performance: z.array(z.object({
      academic_year__year: z.string(),
      avg_score: z.number(),
      min_score: z.number(),
      max_score: z.number(),
      variance_indicator: z.number()
    })),
    subject_performance: z.array(z.object({
      subject__name: z.string(),
      overall_avg: z.number(),
      lowest_score: z.number(),
      highest_score: z.number(),
      volatility: z.number()
    }))
  }),
  comprehensive_ai_report: z.object({
    report_title: z.string(),
    report_metadata: z.object({
      student_name: z.string(),
      analysis_span: z.string(),
      evaluation_type: z.string()
    }),
    executive_summary: z.string(),
    academic_trajectory_analysis: z.string(),
    subject_diagnostics: z.array(z.object({
      subject_name: z.string(),
      overall_average: z.number(),
      historical_trajectory: z.string(),
      gap_analysis: z.string(),
      mastery_level: z.string(),
      suggested_study_technique: z.string(),
      weekly_hours_needed: z.number()
    })),
    behavioral_and_psychological_indicators: z.string(),
    risk_assessment: z.object({
      risk_level: z.string(),
      identified_risks: z.array(z.string()),
      preventive_measures: z.array(z.string())
    }),
    teacher_action_plans: z.array(z.object({
      teacher_name: z.string(),
      subject: z.string(),
      diagnostic_observation: z.string(),
      pedagogical_strategy: z.string(),
      feedback_loop_mechanism: z.string()
    })),
    parental_guidance: z.array(z.string()),
    implementation_roadmap: z.array(z.object({
      phase_name: z.string(),
      goals: z.array(z.string()),
      action_items: z.array(z.string())
    })),
    quality_consultant_final_verdict: z.string()
  })
});
