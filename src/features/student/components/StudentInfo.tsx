import { GraduationCap, UserRound } from 'lucide-react';
import type { Student } from '../types/student.types';
export default function StudentInfo({ student }: { student: Student }) { return <section className="student-info panel"><span className="avatar"><UserRound size={29} fill="currentColor" /></span><div><h1>{student.student_name}</h1><p>البيانات الأكاديمية المسجلة في النظام</p></div><GraduationCap className="student-cap" size={66} strokeWidth={1.2} /></section>; }
