import { useState } from 'react';
import { useGetStudentQuery } from '../api/studentApi';
import { demoStudent } from '../data/demo';
export function useStudent() {
  const query = useGetStudentQuery();
  const [demo, setDemo] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const student = demo ? demoStudent : query.data;
  const years = student ? [...student.academic_years].sort((a, b) => a.year_label.localeCompare(b.year_label)) : [];
  const selected = years.find(year => year.year_id === selectedId) || years.at(-1);
  const toggleDemo = () => { setDemo(value => !value); setSelectedId(null); };
  return { ...query, student, years, selected, select: setSelectedId, demo, toggleDemo };
}
