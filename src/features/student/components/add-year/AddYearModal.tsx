'use client';
import { useEffect, useRef, useState } from 'react';
import { X, CalendarPlus, Pencil } from 'lucide-react';
import type { AcademicYear } from '../../types/student.types';
import type { YearFormValues } from '../../schema/student.schema';
import { useManageGradesMutation } from '../../api/studentApi';
import AddYearForm from './AddYearForm';
const CLOSE_ANIMATION_MS = 200;
export default function AddYearModal({ studentId, existing, close, onSaved }: { studentId: number; existing?: AcademicYear; close: () => void; onSaved: (message: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const [manageGrades, { isLoading, error }] = useManageGradesMutation();
  useEffect(() => { const previous = document.activeElement as HTMLElement; const element = dialog.current; element?.showModal(); const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { element?.close(); document.body.style.overflow = previousOverflow; previous?.focus(); }; }, []);
  const requestClose = () => { if (closing) return; setClosing(true); setTimeout(close, CLOSE_ANIMATION_MS); };
  const submit = async (values: YearFormValues) => {
    const result = await manageGrades({ student_id: studentId, academic_year_id: values.academic_year_id, grades: values.grades.map(grade => ({ subject_id: grade.subject_id, score: Number(grade.score) })) });
    if ('data' in result && result.data) { onSaved(result.data.message); requestClose(); }
  };
  const serverError = error ? (('data' in error && (error.data as { message?: string })?.message) || 'تعذر حفظ الدرجات، حاول مرة أخرى') : undefined;
  return <dialog ref={dialog} className={`year-dialog ${closing ? 'is-closing' : ''}`} onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose(); } }} aria-labelledby="modal-title"><div className="modal-header"><span className="modal-symbol">{existing ? <Pencil size={23} /> : <CalendarPlus size={25} />}</span><div><h2 id="modal-title">{existing ? `تعديل السنة الدراسية ${existing.year_label}` : 'إضافة سنة جديدة'}</h2><p>خطوة جديدة في رحلتك الدراسية</p></div><button className="icon-button modal-close" onClick={requestClose} aria-label="إغلاق"><X size={21} /></button></div><AddYearForm existing={existing} submit={submit} submitting={isLoading} serverError={serverError} /></dialog>;
}
