'use client';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ReportSubjectPerformance } from '../../types/student.types';

export default function ReportSubjectChart({ subjects }: { subjects: ReportSubjectPerformance[] }) {
  const data = subjects.map(subject => ({ name: subject.subject__name, score: subject.overall_avg }));
  return <div className="chart-canvas bar-canvas" dir="ltr" role="img" aria-label="أداء المواد">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 22, right: 8, left: -25, bottom: 5 }}>
        <defs><linearGradient id="reportSubjectFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9bc4ff" /><stop offset="100%" stopColor="#4f7fc9" /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#ffffff09" />
        <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#267372' }} interval={0} tick={{ fill: '#d0e1df', fontSize: data.length > 6 ? 8 : 10 }} height={55} tickFormatter={name => name.replace('اللغة ', '').replace('الدراسات الاجتماعية', 'الدراسات')} />
        <YAxis domain={[0, 100]} tick={{ fill: '#c2d9d7', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={{ background: '#07383b', border: '1px solid #267372', borderRadius: 10, color: '#fff' }} formatter={value => [`${value}%`, 'المتوسط']} />
        <Bar dataKey="score" fill="url(#reportSubjectFill)" radius={[5, 5, 0, 0]} maxBarSize={48}>
          <LabelList dataKey="score" position="top" fill="#f0ffff" fontSize={10} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
