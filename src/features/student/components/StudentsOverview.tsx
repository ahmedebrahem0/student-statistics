'use client';

import Link from 'next/link';
import { ArrowLeft, Award, CalendarDays, GraduationCap, TrendingUp, UsersRound } from 'lucide-react';
import Navigation from '@/shared/components/layout/Navigation';
import Footer from '@/shared/components/layout/Footer';
import Loader from '@/shared/components/common/Loader';
import ErrorMessage from '@/shared/components/common/ErrorMessage';
import EmptyState from '@/shared/components/common/EmptyState';
import { useGetStudentsComparisonQuery } from '../api/studentApi';
import { numberLabel, ratingLabel } from '../utils/student.utils';
import StudentsComparisonChart from './StudentsComparisonChart';
import StudentMiniTrend from './StudentMiniTrend';

export default function StudentsOverview() {
  const { data: students, isLoading, isFetching, isError, refetch } = useGetStudentsComparisonQuery();

  const average = students?.length ? students.reduce((sum, student) => sum + student.overall_gpa, 0) / students.length : 0;
  const excellentCount = students?.filter((student) => student.overall_rating === 'Excellent').length ?? 0;
  const rankedStudents = students ? [...students].sort((a, b) => b.overall_gpa - a.overall_gpa) : [];

  return <div className="app-shell">
    <Navigation />
    <main className="dashboard students-dashboard">
      <header className="student-overview-hero panel">
        <div className="student-overview-icon"><GraduationCap size={31} /></div>
        <div>
          <span className="eyebrow">مشهد الأداء الطلابي</span>
          <h1>مقارنة أداء الطلاب</h1>
          <p>قراءة موحدة للمعدلات والاتجاهات السنوية، لمتابعة كل طالب بوضوح.</p>
        </div>
      </header>

      {isLoading ? <Loader /> : isError || !students ? <ErrorMessage retry={() => void refetch()} busy={isFetching} title="تعذر تحميل مقارنة الطلاب" description="لم نتمكن من جلب بيانات المقارنة حاليًا. حاول مرة أخرى بعد قليل." /> : students.length === 0 ? <section className="panel student-overview-state">
        <EmptyState title="لا يوجد طلاب بعد" description="ستظهر المقارنة هنا عند توفر بيانات الطلاب." />
      </section> : <>
        <section className="student-overview-summary" aria-label="ملخص أداء الطلاب">
          <div className="panel"><span>إجمالي الطلاب</span><div><strong>{students.length}</strong><UsersRound /></div></div>
          <div className="panel"><span>المتوسط العام</span><div><strong dir="ltr">{numberLabel(average)}</strong><TrendingUp /></div></div>
          <div className="panel"><span>طلاب بتقدير ممتاز</span><div><strong>{excellentCount}</strong><Award /></div></div>
        </section>

        <section className="student-ranking panel" aria-labelledby="student-ranking-title">
          <div className="students-section-heading">
            <div><span className="eyebrow">الاتجاهات السنوية</span><h2 id="student-ranking-title">مقارنة تطور أداء الطلاب</h2></div>
            <span>المعدل من 100</span>
          </div>
          <StudentsComparisonChart students={students} />
        </section>

        <section className="students-overview-list" aria-labelledby="students-list-title">
          <div className="students-section-heading">
            <div><span className="eyebrow">التفاصيل السنوية</span><h2 id="students-list-title">بطاقات الطلاب</h2></div>
            <span>{students.length} طالب</span>
          </div>
          <div className="student-overview-grid">
            {rankedStudents.map((student, index) => {
              const latest = student.yearly_performance.at(-1);
              return <article className="student-overview-card panel" key={student.student_id}>
                <div className="student-card-head">
                  <span className="student-rank" aria-label={`الترتيب ${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{student.student_name}</h3><p><CalendarDays size={13} />{student.yearly_performance.length} {student.yearly_performance.length === 1 ? 'سنة دراسية' : 'سنوات دراسية'}</p></div>
                  <span className={`student-rating ${student.overall_gpa < 50 ? 'is-low' : ''}`}>{ratingLabel(student.overall_rating)}</span>
                </div>
                <div className="student-card-body">
                  <div className="student-gpa"><span>المعدل العام</span><strong dir="ltr">{numberLabel(student.overall_gpa)}<small> / 100</small></strong></div>
                  <StudentMiniTrend years={student.yearly_performance} />
                </div>
                <div className="student-card-foot">
                  <span>أحدث سنة <b dir="ltr">{latest?.year_label ?? '—'}</b></span>
                  <Link href={`/student/${student.student_id}`} aria-label={`عرض تفاصيل ${student.student_name}`}>عرض التفاصيل <ArrowLeft size={15} /></Link>
                </div>
              </article>;
            })}
          </div>
        </section>
      </>}
      <Footer />
    </main>
  </div>;
}
