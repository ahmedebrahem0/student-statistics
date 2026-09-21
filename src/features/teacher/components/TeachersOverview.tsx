"use client";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useGetTeachersQuery } from "../api/teacherApi";
import TeacherNavigation from "./TeacherNavigation";
import TeacherTrendChart from "./TeacherTrendChart";
import Loader from "@/shared/components/common/Loader";
import ErrorMessage from "@/shared/components/common/ErrorMessage";
import EmptyState from "@/shared/components/common/EmptyState";
import Footer from "@/shared/components/layout/Footer";
import { ratingLabel } from "@/features/student/utils/student.utils";
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
            <section className="teachers-list" aria-labelledby="teachers-title">
              <div className="teachers-heading">
                <div>
                  <span className="eyebrow">المشهد الكامل</span>
                  <h2 id="teachers-title">المعلمون حسب الأداء السنوي</h2>
                </div>
              </div>
              {teachers.map((teacher) => {
                const latest = teacher.yearly_performance.at(-1);
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
                    <TeacherTrendChart
                      data={teacher.yearly_performance}
                      compact
                    />
                    <div className="teacher-metrics">
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
