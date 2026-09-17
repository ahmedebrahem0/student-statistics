import type { AcademicYear } from '../types/student.types';
export const mapYears = (years: AcademicYear[]) => years.map(year => ({ year: year.year_label, gpa: year.gpa }));
export const mapSubjects = (year: AcademicYear) => year.subjects.map(subject => ({ name: subject.name, score: Number(subject.score) }));
