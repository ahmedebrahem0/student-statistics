'use client';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useLazyGetPredictionQuery } from '../api/studentApi';
import { predictYearSchema } from '../schema/student.schema';
import { numberLabel, ratingFor, ratingLabel } from '../utils/student.utils';

type FormValues = { year: string };

export default function PredictionPanel({ studentId, latestYearLabel }: { studentId: number; latestYearLabel?: string }) {
  const [trigger, { data, isFetching, isError, error }] = useLazyGetPredictionQuery();
  const [requestedYear, setRequestedYear] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const suggestedYear = latestYearLabel ? Number(latestYearLabel.slice(5)) + 1 : new Date().getFullYear() + 1;
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({ defaultValues: { year: String(suggestedYear) } });
  const submit = (values: FormValues) => {
    const parsed = predictYearSchema.safeParse(values.year);
    if (!parsed.success) { setError('year', { message: parsed.error.issues[0].message }); return; }
    const year = Number(values.year);
    setRequestedYear(year);
    trigger({ studentId, year });
  };
  useEffect(() => { if (data && requestedYear === data.target_year) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [data, requestedYear]);
  const serverError = isError ? (error && 'data' in error && ((error.data as { message?: string; error?: string })?.message || (error.data as { message?: string; error?: string })?.error)) || 'تعذر توليد التوقع لهذه السنة' : undefined;
  const chartData = data?.predictions.map(item => ({ name: item.subject_name, score: item.predicted_score })) || [];

  return <section className="chart-panel panel prediction-panel" aria-label="توقع الأداء الدراسي">
    <div className="section-heading"><h2><Sparkles size={16} />توقع الأداء الدراسي</h2><span className="chart-subtitle">تنبؤ ذكي بناءً على السنوات السابقة</span></div>
    <form className="prediction-form" onSubmit={handleSubmit(submit)} noValidate><label>السنة الدراسية المستهدفة<input {...register('year')} type="number" inputMode="numeric" dir="ltr" placeholder={String(suggestedYear)} aria-invalid={Boolean(errors.year)} />{errors.year && <span className="field-error">{errors.year.message}</span>}</label><button className="primary-button" type="submit" disabled={isFetching}>{isFetching ? 'جارٍ التوقع...' : 'توقّع الأداء'}</button></form>
    {serverError && <p className="field-error" role="alert"><AlertCircle size={14} />{serverError}</p>}
    {data && requestedYear === data.target_year && <div className="prediction-result prediction-highlight" ref={resultRef}>
      <div className="details-summary prediction-summary"><span>المعدل المتوقع لسنة <b dir="ltr">{data.target_year}</b></span><strong dir="ltr">{numberLabel(data.predicted_gpa)}<small> / 100</small></strong></div>
      <span className="rating-badge prediction-rating">{ratingLabel(ratingFor(data.predicted_gpa))}</span>
      <div className="chart-canvas bar-canvas" dir="ltr" role="img" aria-label={`توقع درجات المواد لسنة ${data.target_year}`}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 22, right: 8, left: -25, bottom: 5 }}><defs><linearGradient id="predictFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#51d6c3" /><stop offset="100%" stopColor="#3b928c" /></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff09" /><XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#267372' }} interval={0} tick={{ fill: '#d0e1df', fontSize: chartData.length > 6 ? 8 : 10 }} height={55} tickFormatter={name => name.replace('اللغة ', '').replace('الدراسات الاجتماعية', 'الدراسات')} /><YAxis domain={[0, 100]} tick={{ fill: '#c2d9d7', fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: '#ffffff08' }} contentStyle={{ background: '#07383b', border: '1px solid #267372', borderRadius: 10, color: '#fff' }} formatter={value => [`${value}%`, 'المتوقع']} /><Bar dataKey="score" fill="url(#predictFill)" radius={[5, 5, 0, 0]} maxBarSize={48}><LabelList dataKey="score" position="top" fill="#f0ffff" fontSize={10} /></Bar></BarChart></ResponsiveContainer></div>
    </div>}
  </section>;
}
