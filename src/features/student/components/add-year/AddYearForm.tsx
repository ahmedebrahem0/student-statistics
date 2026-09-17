'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { Check, AlertCircle } from 'lucide-react';
import { yearFormSchema, type YearFormValues } from '../../schema/student.schema';
import type { AcademicYear, SubjectOption } from '../../types/student.types';
import { useGetSubjectsQuery } from '../../api/studentApi';
import Loader from '@/shared/components/common/Loader';
import SubjectInput from './SubjectInput';
export default function AddYearForm({ existing, submit, submitting, serverError }: { existing?: AcademicYear; submit: (values: YearFormValues) => void; submitting: boolean; serverError?: string }) {
  const { data: subjects, isLoading, isError } = useGetSubjectsQuery();
  if (isLoading) return <Loader compact />;
  if (isError || !subjects?.length) return <p className="field-error" role="alert"><AlertCircle size={14} />تعذر تحميل قائمة المواد الدراسية. أعد المحاولة لاحقًا.</p>;
  return <AddYearFormFields existing={existing} subjects={subjects} submit={submit} submitting={submitting} serverError={serverError} />;
}
function AddYearFormFields({ existing, subjects, submit, submitting, serverError }: { existing?: AcademicYear; subjects: SubjectOption[]; submit: (values: YearFormValues) => void; submitting: boolean; serverError?: string }) {
  const defaultGrades = subjects.map(subject => { const existingSubject = existing?.subjects.find(s => s.name === subject.name); return { subject_id: subject.id, name: subject.name, score: existingSubject?.score ? String(Number(existingSubject.score)) : '' }; });
  const { register, control, handleSubmit, formState: { errors } } = useForm<YearFormValues>({ defaultValues: { academic_year_id: existing?.year_id, grades: defaultGrades }, resolver: async values => { const result = yearFormSchema.safeParse(values); if (result.success) return { values: result.data, errors: {} }; const fieldErrors: Record<string, unknown> = {}; for (const issue of result.error.issues) { const path = issue.path.map(String); let cursor = fieldErrors; for (let i = 0; i < path.length - 1; i++) { const key = path[i]; cursor = (cursor[key] ??= {}) as Record<string, unknown>; } cursor[path[path.length - 1]] = { type: 'validation', message: issue.message }; } return { values: {}, errors: fieldErrors }; } });
  const { fields } = useFieldArray({ control, name: 'grades' });
  return <form onSubmit={handleSubmit(submit)} noValidate><div className="form-section-heading"><h3>المواد الدراسية</h3><span>الدرجة من 100</span></div><div className="subject-fields">{fields.map((field, index) => <SubjectInput key={field.id} index={index} name={field.name} register={register} scoreError={errors.grades?.[index]?.score?.message} />)}</div>{errors.grades?.message && <p className="field-error" role="alert">{errors.grades.message}</p>}{serverError && <p className="field-error" role="alert"><AlertCircle size={14} />{serverError}</p>}<p className="local-note">{existing ? 'سيتم تحديث درجات هذه السنة مباشرة على الخادم.' : 'سيتم إضافة سنة دراسية جديدة تلقائيًا بعد آخر سنة مسجلة، وحفظها مباشرة على الخادم.'} يُحسب المعدل والتقدير تلقائيًا.</p><div className="form-actions"><button className="primary-button" type="submit" disabled={submitting}><Check size={18} />{submitting ? 'جارٍ الحفظ...' : existing ? 'حفظ التعديلات' : 'إضافة السنة'}</button></div></form>;
}
