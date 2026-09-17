'use client';
import { useEffect, useRef } from 'react';
import { X, CalendarPlus, Pencil } from 'lucide-react';
import type { AcademicYear } from '../../types/student.types';
import AddYearForm from './AddYearForm';
export default function AddYearModal({ existing, years, save, close }: { existing?: AcademicYear; years: AcademicYear[]; save: (year: AcademicYear) => void; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement; const element = dialog.current; element?.showModal(); const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { element?.close(); document.body.style.overflow = previousOverflow; previous?.focus(); }; }, []);
  return <dialog ref={dialog} className="year-dialog" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }} aria-labelledby="modal-title"><div className="modal-header"><span className="modal-symbol">{existing ? <Pencil size={23} /> : <CalendarPlus size={25} />}</span><div><h2 id="modal-title">{existing ? 'تعديل السنة الدراسية' : 'إضافة سنة جديدة'}</h2><p>خطوة جديدة في رحلتك الدراسية</p></div><button className="icon-button modal-close" onClick={close} aria-label="إغلاق"><X size={21} /></button></div><AddYearForm existing={existing} years={years} save={save} close={close} /></dialog>;
}
