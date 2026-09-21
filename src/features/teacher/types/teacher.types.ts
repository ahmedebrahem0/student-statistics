export interface TeacherYearPerformance { year_id: number; year_label: string; avg_score: number; rating: string; students_count: number }
export interface TeacherComparison { id: number; name: string; is_general: boolean; subject: string; yearly_performance: TeacherYearPerformance[] }
export interface TeacherStudentPoint { year: string; gpa: number; rating: string }
export interface TeacherStudent { student_id: number; student_name: string; chart_data: TeacherStudentPoint[] }
export interface TeacherDetail { id: number; name: string; is_general: boolean; subject: string; overall_performance: number; total_students: number; students: TeacherStudent[] }
