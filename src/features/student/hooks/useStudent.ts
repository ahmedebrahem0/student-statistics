import { useState } from 'react';
import { useGetStudentQuery } from '../api/studentApi';
export function useStudent() {
  const query = useGetStudentQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const student = query.data;
  const years = student ? [...student.academic_years].sort((a, b) => a.year_label.localeCompare(b.year_label)) : [];
  const selected = years.find(year => year.year_id === selectedId) || years.at(-1);
  return { ...query, student, years, selected, select: setSelectedId };
}
