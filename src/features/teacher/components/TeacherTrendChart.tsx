'use client';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TeacherStudentPoint, TeacherYearPerformance } from '../types/teacher.types';
type Point = TeacherStudentPoint | TeacherYearPerformance;
export default function TeacherTrendChart({ data, compact = false }: { data: Point[]; compact?: boolean }) {
  const points = data.map(point => ({ year: 'year' in point ? point.year : point.year_label, score: 'gpa' in point ? point.gpa : point.avg_score }));
  if (!points.length) return <div className="teacher-chart-empty">لا توجد بيانات سنوية</div>;
  return <div className={compact ? 'teacher-sparkline' : 'teacher-detail-chart'} dir="ltr"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={compact ? { top: 7, right: 7, bottom: 3, left: 7 } : { top: 12, right: 10, bottom: 5, left: -18 }}><CartesianGrid stroke="#216065" strokeDasharray="3 5" vertical={!compact} opacity={compact ? .25 : .55} /><XAxis dataKey="year" hide={compact} tick={{ fill: '#abc8c5', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} hide={compact} tick={{ fill: '#abc8c5', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#07383b', border: '1px solid #3b928c', borderRadius: 9, direction: 'rtl' }} labelStyle={{ color: '#eff9f7' }} formatter={(value) => [`${Number(value).toFixed(1)} / 100`, 'المعدل']} /><Line type="monotone" dataKey="score" stroke="#51d6c3" strokeWidth={compact ? 2.5 : 3} dot={compact ? false : { r: 4, fill: '#032629', strokeWidth: 2 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div>;
}
