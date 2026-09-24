import type { ReactNode } from 'react';
import { CalendarDays, GraduationCap, UserRound } from 'lucide-react';
import type { Student } from '../types/student.types';

export default function StudentInfo({ student, count, exam }: { student: Student; count: number; exam?: ReactNode }) {
  return <section className="student-info panel">
    <div className="student-info-profile">
      <span className="avatar"><UserRound size={29} fill="currentColor" /></span>
      <div className="student-info-identity"><h1>{student.student_name}</h1><p>رحلتك الدراسية، في مكان واحد</p></div>
    </div>
    {exam && <div className="student-info-exam">{exam}</div>}
    <div className="student-info-extra"><CalendarDays size={19} /><span>{count} سنوات دراسية</span></div>
    <GraduationCap className="student-cap" size={66} strokeWidth={1.2} />
  </section>;
}
