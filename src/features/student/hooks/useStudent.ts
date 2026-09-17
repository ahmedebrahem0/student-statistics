import { useState } from 'react';
import { useGetStudentQuery } from '../api/studentApi';
import { demoStudent } from '../data/demo';
import type { AcademicYear } from '../types/student.types';
export function useStudent() {
  const query = useGetStudentQuery();
  const [demo, setDemo] = useState(false);
  const [changes, setChanges] = useState<Record<number, AcademicYear>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const student = demo ? demoStudent : query.data;
  const years = student ? [...student.academic_years.map(year => changes[year.year_id] || year), ...Object.values(changes).filter(year => !student.academic_years.some(original => original.year_id === year.year_id))].sort((a, b) => a.year_label.localeCompare(b.year_label)) : [];
  const selected = years.find(year => year.year_id === selectedId) || years.at(-1);
  const saveYear = (year: AcademicYear) => { setChanges(previous => ({ ...previous, [year.year_id]: year })); setSelectedId(year.year_id); };
  const toggleDemo = () => { setDemo(value => !value); setChanges({}); setSelectedId(null); };
  return { ...query, student, years, selected, select: setSelectedId, saveYear, demo, toggleDemo, hasChanges: Object.keys(changes).length > 0 };
}
