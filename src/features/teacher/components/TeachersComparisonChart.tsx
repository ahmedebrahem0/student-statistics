'use client';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TeacherComparison } from '../types/teacher.types';

const COLORS = ['#51d6c3', '#f6b93b', '#e17055', '#74b9ff', '#a29bfe', '#ff7675', '#55efc4', '#fd79a8', '#fab1a0', '#81ecec'];

export default function TeachersComparisonChart({ teachers }: { teachers: TeacherComparison[] }) {
  const years = Array.from(new Set(teachers.flatMap(t => t.yearly_performance.map(y => y.year_label)))).sort();
  const rows = years.map(year => {
    const row: Record<string, string | number> = { year };
    teachers.forEach(teacher => {
      const point = teacher.yearly_performance.find(y => y.year_label === year);
      if (point) row[teacher.name] = point.avg_score;
    });
    return row;
  });
  if (!rows.length) return <div className="teacher-chart-empty">لا توجد بيانات سنوية</div>;
  return (
    <div className="teacher-comparison-chart" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 12, right: 20, bottom: 5, left: -18 }}>
          <CartesianGrid stroke="#216065" strokeDasharray="3 5" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fill: '#abc8c5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#abc8c5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#07383b', border: '1px solid #3b928c', borderRadius: 9, direction: 'rtl' }} labelStyle={{ color: '#eff9f7' }} formatter={(value, name) => [`${Number(value).toFixed(1)} / 100`, name]} />
          <Legend wrapperStyle={{ direction: 'rtl', fontSize: 12, paddingTop: 10 }} />
          {teachers.map((teacher, index) => (
            <Line key={teacher.id} type="monotone" dataKey={teacher.name} stroke={COLORS[index % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
