'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import type { StudentYearComparison } from '../types/student.types';
import { numberLabel, ratingLabel } from '../utils/student.utils';

export default function StudentMiniTrend({ years }: { years: StudentYearComparison[] }) {
  if (!years.length) return <div className="student-mini-empty">لا توجد سنوات مسجلة</div>;
  return <div className="student-mini-trend" dir="ltr" aria-label="اتجاه الأداء السنوي">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={years} margin={{ top: 8, right: 5, bottom: 5, left: 5 }}>
        <YAxis domain={[0, 100]} hide />
        <Tooltip contentStyle={{ background: '#07383b', border: '1px solid #3b928c', borderRadius: 8, direction: 'rtl', fontSize: 11 }} labelFormatter={(_, payload) => payload[0]?.payload.year_label ?? ''} formatter={(value, _name, item) => [`${numberLabel(Number(value))} / 100`, ratingLabel(item.payload.rating)]} />
        <Line type="monotone" dataKey="gpa" stroke="#51d6c3" strokeWidth={2.5} dot={{ r: 2.5, fill: '#032629', strokeWidth: 2 }} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>;
}
