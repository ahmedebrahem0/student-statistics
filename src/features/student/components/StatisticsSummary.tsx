import { Star } from 'lucide-react';
import type { AcademicYear } from '../types/student.types';
import { numberLabel } from '../utils/student.utils';
export default function StatisticsSummary({ years }: { years: AcademicYear[] }) { const latest = years.at(-1); return <section className="statistics" aria-label="ملخص الأداء"><article className="stat panel"><span className="stat-label"><Star className="stat-icon" fill="currentColor" />أحدث معدل مسجل <b>GPA</b></span><div className="stat-value"><strong dir="ltr">{latest ? numberLabel(latest.gpa) : '—'}</strong></div></article></section>; }
