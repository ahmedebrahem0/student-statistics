"use client";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useGetTeacherQuery } from "../api/teacherApi";
import TeacherNavigation from "./TeacherNavigation";
import TeacherTrendChart from "./TeacherTrendChart";
import Loader from "@/shared/components/common/Loader";
import ErrorMessage from "@/shared/components/common/ErrorMessage";
import EmptyState from "@/shared/components/common/EmptyState";
import Footer from "@/shared/components/layout/Footer";
import { numberLabel, ratingFor, ratingLabel } from "@/features/student/utils/student.utils";
export default function TeacherDetails({ teacherId }: { teacherId: number }) {
  const {
    data: teacher,
    isLoading,
    isFetching,
    refetch,
  } = useGetTeacherQuery(teacherId);
  return (
    <div className="app-shell">
      <TeacherNavigation />
      <main className="dashboard teacher-dashboard">
        {isLoading ? (
          <Loader />
        ) : !teacher ? (
          <ErrorMessage
            retry={() => {
              void refetch();
            }}
            busy={isFetching}
          />
        ) : (
          <>
            <Link className="teacher-back" href="/teachers">
              <ArrowRight size={17} />
              العودة إلى مقارنة المعلمين
            </Link>
            <header className="teacher-profile panel">
              <div className="teacher-profile-symbol">
                <GraduationCap size={34} />
              </div>
              <div className="teacher-profile-copy">
                <span className="eyebrow">ملف أداء المعلم</span>
                <h1>{teacher.name}</h1>
                <p>
                  <BookOpen size={14} />
                  {teacher.is_general
                    ? "معلم عام — جميع المواد"
                    : `معلم ${teacher.subject}`}
                </p>
              </div>
              <div className="teacher-score">
                <span>الأداء العام</span>
                <strong dir="ltr">
                  {numberLabel(teacher.overall_performance)}
                </strong>
                <small>{ratingLabel(ratingFor(teacher.overall_performance))}</small>
              </div>
              <div className="teacher-total">
                <UsersRound />
                <span>إجمالي الطلاب</span>
                <strong>{teacher.total_students}</strong>
              </div>
            </header>
            <section
              className="student-performance"
              aria-labelledby="student-performance-title"
            >
              <div className="teachers-heading">
                <div>
                  <span className="eyebrow">داخل الفصل</span>
                  <h2 id="student-performance-title">تطور أداء الطلاب</h2>
                </div>
                <span>{teacher.students.length} طالب</span>
              </div>
              {teacher.students.length === 0 ? (
                <div className="panel teacher-state">
                  <EmptyState
                    title="لا توجد بيانات طلاب"
                    description="لم تُسجل نتائج طلاب لهذا المعلم حتى الآن."
                  />
                </div>
              ) : (
                <div className="student-trends">
                  {teacher.students.map((student) => (
                    <article
                      className="student-trend panel"
                      key={student.student_id}
                    >
                      <div className="student-trend-head">
                        <div className="student-avatar">
                          <span>{student.student_name.trim().charAt(0)}</span>
                        </div>
                        <div>
                          <h3>{student.student_name}</h3>
                          <p>{student.chart_data.length} سنوات دراسية</p>
                        </div>
                        {student.chart_data.length > 1 && <span className="trend-pill"><TrendingUp size={13} />اتجاه سنوي</span>}
                      </div>
                      <TeacherTrendChart data={student.chart_data} />
                      {student.chart_data.length > 0 && (
                        <div className="student-years">
                          {student.chart_data.map((point) => (
                            <div key={point.year}>
                              <span dir="ltr">{point.year}</span>
                              <strong dir="ltr">
                                {numberLabel(point.gpa)}
                              </strong>
                              <small>{ratingLabel(point.rating)}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
            <Footer />
          </>
        )}
      </main>
    </div>
  );
}
