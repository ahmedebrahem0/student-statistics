'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { StudentComparison } from '../types/student.types';
import { numberLabel, ratingFor, ratingLabel } from '../utils/student.utils';

const LINE_COLORS = ['#51d6c3', '#f6b93b', '#74b9ff', '#ff7675', '#a29bfe', '#55efc4', '#fd79a8', '#fab1a0', '#81ecec', '#e17055'];
const RATING_COLORS: Record<string, string> = { Excellent: '#43d19e', 'Very Good': '#55d9d0', Good: '#f6c85f', Pass: '#f39c5a', Fail: '#ff625c' };

type ChartRow = { year: string; ratings: Record<string, string>; [key: string]: string | number | Record<string, string> };
type DotProps = { cx?: number; cy?: number; value?: number; payload?: ChartRow };
type TooltipEntry = { value?: string | number; name?: string; dataKey?: string | number; color?: string; payload?: ChartRow };

function yearOrder(label: string) {
  const match = label.match(/\d{4}/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
}

function RatingDot({ cx, cy, value, payload, dataKey, lineColor }: DotProps & { dataKey: string; lineColor: string }) {
  if (cx === undefined || cy === undefined || value === undefined) return null;
  const rating = payload?.ratings[dataKey] ?? ratingFor(Number(value));
  return <circle cx={cx} cy={cy} r={4.5} fill={RATING_COLORS[rating] ?? RATING_COLORS[ratingFor(Number(value))]} stroke={lineColor} strokeWidth={2.5} />;
}

function StudentTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="student-chart-tooltip" dir="rtl">
    <strong>{label}</strong>
    {payload.map((entry) => {
      const rating = entry.payload?.ratings[String(entry.dataKey)] ?? ratingFor(Number(entry.value));
      return <div key={String(entry.dataKey)}>
        <i style={{ background: entry.color }} />
        <span>{entry.name}</span>
        <bdi dir="ltr">{numberLabel(Number(entry.value))} / 100</bdi>
        <small>{ratingLabel(rating)}</small>
      </div>;
    })}
  </div>;
}

export default function StudentsComparisonChart({ students }: { students: StudentComparison[] }) {
  const years = Array.from(new Set(students.flatMap((student) => student.yearly_performance.map((year) => year.year_label))))
    .sort((a, b) => yearOrder(a) - yearOrder(b) || a.localeCompare(b));
  const rows: ChartRow[] = years.map((year) => {
    const row: ChartRow = { year, ratings: {} };
    students.forEach((student) => {
      const point = student.yearly_performance.find((item) => item.year_label === year);
      if (!point) return;
      const key = `student_${student.student_id}`;
      row[key] = point.gpa;
      row.ratings[key] = point.rating;
    });
    return row;
  });

  if (!rows.length) return <div className="teacher-chart-empty">لا توجد بيانات سنوية للمقارنة</div>;

  const chartWidth = Math.max(650, years.length * 108);
  const chartHeight = Math.max(300, 270 + Math.ceil(students.length / 3) * 22);
  return <div className="student-comparison-wrap">
    <div className="student-series-key" aria-label="دليل ألوان الطلاب">
      {students.map((student, index) => <span key={student.student_id}><i style={{ background: LINE_COLORS[index % LINE_COLORS.length] }} />{student.student_name}</span>)}
    </div>
    <div className={`student-comparison-scroll ${years.length > 6 ? 'is-wide' : ''}`} tabIndex={years.length > 5 ? 0 : undefined} aria-label="مقارنة أداء الطلاب عبر السنوات، يمكن التمرير أفقيًا">
    <div className="student-comparison-chart" style={{ minWidth: years.length > 6 ? chartWidth : undefined, height: chartHeight }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 15, right: 24, bottom: 8, left: -10 }}>
          <CartesianGrid stroke="#216065" strokeDasharray="3 5" opacity={0.5} />
          <XAxis dataKey="year" tick={{ fill: '#abc8c5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: '#abc8c5', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<StudentTooltip />} />
          {students.map((student, index) => {
            const dataKey = `student_${student.student_id}`;
            const lineColor = LINE_COLORS[index % LINE_COLORS.length];
            return <Line key={student.student_id} type="monotone" dataKey={dataKey} name={student.student_name} stroke={lineColor} strokeWidth={2.5} dot={(props) => <RatingDot {...props} dataKey={dataKey} lineColor={lineColor} />} activeDot={{ r: 6, strokeWidth: 2 }} connectNulls={false} />;
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
    <div className="student-rating-key" aria-label="دليل ألوان التقييم"><span>لون النقطة:</span>{Object.entries(RATING_COLORS).map(([rating, color]) => <span key={rating}><i style={{ background: color }} />{ratingLabel(rating)}</span>)}</div>
  </div>;
}
