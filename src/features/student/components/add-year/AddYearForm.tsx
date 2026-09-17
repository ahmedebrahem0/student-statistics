'use client';
import { useFieldArray, useForm } from 'react-hook-form';
import { Plus, Check } from 'lucide-react';
import { yearFormSchema, type YearFormValues } from '../../schema/student.schema';
import type { AcademicYear } from '../../types/student.types';
import { ratingFor } from '../../utils/student.utils';
import SubjectInput from './SubjectInput';
export default function AddYearForm({ existing, years, save, close }: { existing?: AcademicYear; years: AcademicYear[]; save: (year: AcademicYear) => void; close: () => void }) {
  const latestStart = Number(years.at(-1)?.year_label.slice(0, 4));
  const nextStart = Number.isFinite(latestStart) && latestStart > 0 ? latestStart + 1 : new Date().getFullYear();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<YearFormValues>({ defaultValues: { year_label: existing?.year_label || `${nextStart}-${nextStart + 1}`, subjects: existing?.subjects.map(subject => ({ name: subject.name, score: subject.score })) || [{ name: '', score: '' }] }, resolver: async values => { const result = yearFormSchema.safeParse(values); if (result.success) return { values: result.data, errors: {} }; const fieldErrors: Record<string, unknown> = {}; for (const issue of result.error.issues) { const path = issue.path.join('.'); fieldErrors[path] = { type: 'validation', message: issue.message }; } return { values: {}, errors: fieldErrors }; } });
  const { fields, append, remove } = useFieldArray({ control, name: 'subjects' });
  const submit = (values: YearFormValues) => {
    if (years.some(year => year.year_label === values.year_label && year.year_id !== existing?.year_id)) { setError('year_label', { message: 'هذه السنة موجودة بالفعل' }); return; }
    const normalized = values.subjects.map(subject => subject.name.trim());
    if (new Set(normalized).size !== normalized.length) { setError('root', { message: 'لا يمكن تكرار اسم المادة في نفس السنة' }); return; }
    const gpa = Math.round(values.subjects.reduce((sum, subject) => sum + Number(subject.score), 0) / values.subjects.length * 100) / 100;
    save({ year_id: existing?.year_id || Math.max(0, ...years.map(year => year.year_id)) + 1, year_label: values.year_label, gpa, overall_rating: ratingFor(gpa), subjects: values.subjects.map(subject => ({ name: subject.name.trim(), score: Number(subject.score).toFixed(2), rating: ratingFor(Number(subject.score)) })) }); close();
  };
  return <form onSubmit={handleSubmit(submit)} noValidate><label className="year-label-field">السنة الدراسية<input {...register('year_label')} dir="ltr" placeholder="2025-2026" aria-invalid={Boolean(errors.year_label)} autoFocus />{errors.year_label && <span className="field-error">{errors.year_label.message}</span>}</label><div className="form-section-heading"><h3>المواد الدراسية</h3><span>الدرجة من 100</span></div><div className="subject-fields">{fields.map((field, index) => <SubjectInput key={field.id} index={index} register={register} remove={() => remove(index)} canRemove={fields.length > 1} nameError={errors.subjects?.[index]?.name?.message} scoreError={errors.subjects?.[index]?.score?.message} />)}</div><button type="button" className="text-button add-subject" onClick={() => append({ name: '', score: '' })}><Plus size={18} />إضافة مادة</button>{errors.root && <p className="field-error" role="alert">{errors.root.message}</p>}<p className="local-note">يُحسب المعدل والتقدير تلقائيًا من درجات المواد. تُحفظ التغييرات مؤقتًا في هذه الجلسة.</p><div className="form-actions"><button className="primary-button" type="submit" disabled={isSubmitting}><Check size={18} />{existing ? 'حفظ التعديلات' : 'إضافة السنة'}</button><button className="secondary-button" type="button" onClick={close}>إلغاء</button></div></form>;
}
