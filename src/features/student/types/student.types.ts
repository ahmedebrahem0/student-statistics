export interface Subject { name: string; score: string; rating: string }
export interface AcademicYear { year_id: number; year_label: string; gpa: number; overall_rating: string; subjects: Subject[] }
export interface Student { id: number; student_name: string; academic_years: AcademicYear[] }
export interface SubjectOption { id: number; name: string }
export interface GradeInput { subject_id: number; score: number }
export interface ManageGradesRequest { student_id: number; academic_year_id?: number; grades: GradeInput[] }
export interface ManageGradesResponse { message: string; data: Student }
export interface SubjectPrediction { subject_id: number; subject_name: string; predicted_score: number; rating: string }
export interface PerformancePrediction { student_id: number; student_name: string; latest_recorded_year: number; target_year: number; predicted_gpa: number; predictions: SubjectPrediction[] }
export interface StudentYearComparison { year_id: number; year_label: string; gpa: number; rating: string }
export interface StudentComparison { student_id: number; student_name: string; overall_gpa: number; overall_rating: string; yearly_performance: StudentYearComparison[] }
export interface ReportTeacher { name: string; subject: string }
export interface ReportYearlyPerformance { academic_year__year: string; avg_score: number; min_score: number; max_score: number; variance_indicator: number }
export interface ReportSubjectPerformance { subject__name: string; overall_avg: number; lowest_score: number; highest_score: number; volatility: number }
export interface StudentReportAnalyticsData { student_id: number; student_name: string; teachers: ReportTeacher[]; yearly_performance: ReportYearlyPerformance[]; subject_performance: ReportSubjectPerformance[] }
export interface ReportMetadata { student_name: string; analysis_span: string; evaluation_type: string }
export interface SubjectDiagnostic { subject_name: string; overall_average: number; historical_trajectory: string; gap_analysis: string; mastery_level: string; suggested_study_technique: string; weekly_hours_needed: number }
export interface RiskAssessment { risk_level: string; identified_risks: string[]; preventive_measures: string[] }
export interface TeacherActionPlan { teacher_name: string; subject: string; diagnostic_observation: string; pedagogical_strategy: string; feedback_loop_mechanism: string }
export interface ImplementationPhase { phase_name: string; goals: string[]; action_items: string[] }
export interface ComprehensiveAiReport {
  report_title: string;
  report_metadata: ReportMetadata;
  executive_summary: string;
  academic_trajectory_analysis: string;
  subject_diagnostics: SubjectDiagnostic[];
  behavioral_and_psychological_indicators: string;
  risk_assessment: RiskAssessment;
  teacher_action_plans: TeacherActionPlan[];
  parental_guidance: string[];
  implementation_roadmap: ImplementationPhase[];
  quality_consultant_final_verdict: string;
}
export interface StudentReport { analytics_data: StudentReportAnalyticsData; comprehensive_ai_report: ComprehensiveAiReport }
