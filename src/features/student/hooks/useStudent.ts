import { useState } from 'react';
import { useGetStudentByIdQuery, useGetStudentQuery } from '../api/studentApi';
export function useStudent(studentId?: number) {
  const byId = useGetStudentByIdQuery(studentId ?? 0, { skip: !studentId });
  const current = useGetStudentQuery(undefined, { skip: Boolean(studentId) });
  const query = studentId ? byId : current;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const student = query.data;
  const years = student ? [...student.academic_years].sort((a, b) => a.year_label.localeCompare(b.year_label)) : [];
  const selected = years.find(year => year.year_id === selectedId) || years.at(-1);
  return { ...query, student, years, selected, select: setSelectedId };
}
