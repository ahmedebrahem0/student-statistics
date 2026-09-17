export interface Subject { name: string; score: string; rating: string }
export interface AcademicYear { year_id: number; year_label: string; gpa: number; overall_rating: string; subjects: Subject[] }
export interface Student { id: number; student_name: string; academic_years: AcademicYear[] }
