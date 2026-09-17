import type { Student } from '../types/student.types';
import { ratingFor } from '../utils/student.utils';
// Explicit preview fixture from the project brief. Never used as an API fallback.
const names = ['اللغة العربية', 'اللغة الإنجليزية', 'الرياضيات', 'العلوم', 'الدراسات الاجتماعية'];
export const demoStudent: Student = { id: 1, student_name: 'أحمد محمود', academic_years: [87.99, 85, 89.2, 92.4, 95].map((gpa, index) => ({ year_id: index + 1, year_label: `${2020 + index}-${2021 + index}`, gpa, overall_rating: ratingFor(gpa), subjects: names.map((name, i) => ({ name, score: String(index === 4 ? [97, 93, 96, 97.98, 91][i] : [90, 85, 88, 92, 84.97][i]), rating: ratingFor(index === 4 ? [97, 93, 96, 97.98, 91][i] : [90, 85, 88, 92, 84.97][i]) })) })) };
