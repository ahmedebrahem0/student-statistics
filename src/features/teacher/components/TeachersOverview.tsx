"use client";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useGetTeachersQuery } from "../api/teacherApi";
import TeacherNavigation from "./TeacherNavigation";
import TeachersComparisonChart from "./TeachersComparisonChart";
import Loader from "@/shared/components/common/Loader";
import ErrorMessage from "@/shared/components/common/ErrorMessage";
import EmptyState from "@/shared/components/common/EmptyState";
import Footer from "@/shared/components/layout/Footer";
import { numberLabel, ratingLabel } from "@/features/student/utils/student.utils";
export default function TeachersOverview() {
  const {
    data: teachers,
    isLoading,
    isFetching,
    refetch,
  } = useGetTeachersQuery();
  return (
    <div className="app-shell">
      <TeacherNavigation />
      <main className="dashboard teacher-dashboard">
        <header className="teacher-hero panel">
          <div className="teacher-hero-icon">
            <GraduationCap size={30} />
          </div>
          <div>
            <span className="eyebrow">لوحة التحليل الأكاديمي</span>
            <h1>مقارنة أداء المعلمين</h1>
            <p>اتجاهات سنوية واضحة تساعدك على قراءة الأداء واتخاذ قرار أدق.</p>
          </div>
        </header>
        {isLoading ? (
          <Loader />
        ) : !teachers ? (
          <ErrorMessage
            retry={() => {
              void refetch();
            }}
            busy={isFetching}
          />
        ) : teachers.length === 0 ? (
          <section className="panel teacher-state">
            <EmptyState
              title="لا يوجد معلمون بعد"
              description="ستظهر المقارنات هنا عند توفر بيانات المعلمين."
            />
          </section>
        ) : (
          <>
            <section className="teacher-summary" aria-label="ملخص المعلمين">
              <div className="panel"><span>إجمالي المعلمين</span><div><strong>{teachers.length}</strong><UserRound /></div></div>
              <div className="panel"><span>التخصصات</span><div><strong>{new Set(teachers.map((teacher) => teacher.subject)).size}</strong><BookOpen /></div></div>
              <div className="panel"><span>أفضل متوسط</span><div><strong dir="ltr">{numberLabel(Math.max(...teachers.map((teacher) => teacher.yearly_performance.at(-1)?.avg_score ?? 0)))}</strong><TrendingUp /></div></div>
            </section>
            <section className="teachers-comparison panel" aria-labelledby="teachers-comparison-title">
              <div className="teachers-heading">
                <div>
                  <span className="eyebrow">اتجاه موحد</span>
                  <h2 id="teachers-comparison-title">مقارنة المعلمين المعدلات عبر السنوات</h2>
                </div>
              </div>
              <TeachersComparisonChart teachers={teachers} />
            </section>
            <section className="teachers-list" aria-labelledby="teachers-title">
              <div className="teachers-heading">
                <div>
                  <span className="eyebrow">المشهد الكامل</span>
                  <h2 id="teachers-title ">المعلمون حسب الأداء السنوي</h2>
                </div>
                <span>{teachers.length} معلم</span>
              </div>
              {teachers.map((teacher) => {
                const latest = teacher.yearly_performance.at(-1);
                const average = teacher.yearly_performance.length ? teacher.yearly_performance.reduce((sum, year) => sum + year.avg_score, 0) / teacher.yearly_performance.length : 0;
                return (
                  <article className="teacher-card panel" key={teacher.id}>
                    <div className="teacher-card-main">
                      <span className="teacher-index" aria-hidden="true">
                        {String(teacher.id).padStart(2, "0")}
                      </span>
                      <div>
                        <h3>{teacher.name}</h3>
                        <p>
                          <BookOpen size={13} />
                          {teacher.is_general ? "معلم عام" : teacher.subject}
                        </p>
                      </div>
                    </div>
                    <div className="teacher-metrics">
                      <div><span>المتوسط العام</span><strong dir="ltr">{numberLabel(average)}</strong></div>
                      <div>
                        <span>أحدث تقييم</span>
                        <strong>
                          {latest ? ratingLabel(latest.rating) : "—"}
                        </strong>
                      </div>
                      <div>
                        <span>عدد الطلاب</span>
                        <strong>{latest?.students_count ?? 0}</strong>
                      </div>
                    </div>
                    <Link
                      className="teacher-open"
                      href={`/teachers/${teacher.id}`}
                      aria-label={`عرض تفاصيل ${teacher.name}`}
                    >
                      عرض التفاصيل
                      <ArrowLeft size={16} />
                    </Link>
                  </article>
                );
              })}
            </section>
            <Footer />
          </>
        )}
      </main>
    </div>
  );
}
