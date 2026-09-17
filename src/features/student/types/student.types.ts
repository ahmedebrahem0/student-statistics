export interface Subject { name: string; score: string; rating: string }
export interface AcademicYear { year_id: number; year_label: string; gpa: number; overall_rating: string; subjects: Subject[] }
export interface Student { id: number; student_name: string; academic_years: AcademicYear[] }
export interface SubjectOption { id: number; name: string }
export interface GradeInput { subject_id: number; score: number }
export interface ManageGradesRequest { student_id: number; academic_year_id?: number; grades: GradeInput[] }
export interface ManageGradesResponse { message: string; data: Student }
export interface SubjectPrediction { subject_name: string; predicted_score: number }
export interface PerformancePrediction { student_id: number; student_name: string; target_year: number; predicted_gpa: number; predictions: SubjectPrediction[] }
