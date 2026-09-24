"use client";
import { useState } from "react";
import {
  CalendarDays,
  Plus,
  Pencil,
  TrendingUp,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Check,
} from "lucide-react";
import { useStudent } from "../hooks/useStudent";
import StudentInfo from "./StudentInfo";
import StatisticsSummary from "./StatisticsSummary";
import GradesLineChart from "./charts/GradesLineChart";
import SubjectsBarChart from "./charts/SubjectsBarChart";
import GradesRadarChart from "./charts/GradesRadarChart";
import PredictionPanel from "./PredictionPanel";
import StudentReportPanel from "./StudentReportPanel";
import AddYearModal from "./add-year/AddYearModal";
import Navigation from "@/shared/components/layout/Navigation";
import Footer from "@/shared/components/layout/Footer";
import Loader from "@/shared/components/common/Loader";
import ErrorMessage from "@/shared/components/common/ErrorMessage";
import EmptyState from "@/shared/components/common/EmptyState";
import { numberLabel, ratingClass, ratingLabel } from "../utils/student.utils";
import StudentExam from "./exam/StudentExam";
export default function StudentOverview({ studentId }: { studentId?: number } = {}) {
  const {
    student,
    years,
    selected,
    select,
    isLoading,
    isFetching,
    refetch,
  } = useStudent(studentId);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const add = () => {
    if (student) setModal("add");
  };
  const edit = () => {
    if (selected) setModal("edit");
  };
  return (
    <div className="app-shell">
      <Navigation />
      <main className="dashboard" id="overview">
        {!student ? (
          isLoading ? (
            <Loader />
          ) : (
            <ErrorMessage
              retry={() => {
                void refetch();
              }}
              busy={isFetching}
            />
          )
        ) : (
          <>
            <StudentInfo
              student={student}
              count={years.length}
              exam={<StudentExam studentId={student.id} studentName={student.student_name} />}
            />
            <StatisticsSummary years={years} />
            {years.length > 0 && (
              <section className="chart-panel panel" id="progress">
                <div className="section-heading">
                  <h2>
                    <TrendingUp size={16} />
                    تطور المعدل الدراسي <span dir="ltr">(GPA)</span>
                  </h2>
                  <span className="chart-subtitle">كل سنة، خطوة للأمام</span>
                </div>
                <GradesLineChart years={years} />
              </section>
            )}
            <section
              className="year-picker panel"
              aria-label="السنوات الدراسية"
            >
              <div className="section-heading">
                <h2>
                  <CalendarDays size={17} />
                  السنوات الدراسية
                </h2>
                <button
                  className="compact-button"
                  onClick={add}
                >
                  <Plus size={16} />
                  إضافة سنة جديدة
                </button>
              </div>
              {years.length > 0 ? (
                <div
                  className="year-tabs"
                  role="group"
                  aria-label="اختيار السنة الدراسية"
                >
                  {years.map((year) => (
                    <button
                      key={year.year_id}
                      dir="ltr"
                      aria-pressed={selected?.year_id === year.year_id}
                      className={
                        selected?.year_id === year.year_id ? "selected" : ""
                      }
                      onClick={() => select(year.year_id)}
                    >
                      {year.year_label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted small">لا توجد سنوات دراسية حتى الآن.</p>
              )}
            </section>
            {years.length > 0 ? (
              <>
                {selected && (
                  <>
                    <div className="comparison-grid">
                      <section className="chart-panel panel">
                        <div className="section-heading">
                          <h2>
                            <ChartNoAxesColumnIncreasing size={16} />
                            مقارنة درجات المواد
                          </h2>
                          <span dir="ltr" className="chart-subtitle">
                            {selected.year_label}
                          </span>
                        </div>
                        {selected.subjects.length ? (
                          <SubjectsBarChart year={selected} />
                        ) : (
                          <EmptyState
                            title="لا توجد مواد لهذه السنة"
                            description="أضف المواد من تعديل السنة الدراسية."
                          />
                        )}
                      </section>
                      <section className="chart-panel panel radar-panel">
                        <div className="section-heading">
                          <h2>أداء المواد</h2>
                          <span className="legend">
                            <i />
                            {selected.year_label}
                          </span>
                        </div>
                        {selected.subjects.length >= 3 ? (
                          <GradesRadarChart year={selected} />
                        ) : (
                          <EmptyState
                            title="مواد أكثر، صورة أوضح"
                            description="يظهر توزيع الأداء عند وجود ثلاث مواد على الأقل."
                          />
                        )}
                      </section>
                    </div>
                    <div className="details-grid">
                      <section className="details-panel panel">
                        <div className="section-heading">
                          <h2>
                            تفاصيل المواد{" "}
                            <span dir="ltr">{selected.year_label}</span>
                          </h2>
                          <button
                            className="compact-button"
                            onClick={edit}
                          >
                            <Pencil size={14} />
                            تعديل السنة
                          </button>
                        </div>
                        {selected.subjects.length ? (
                          <table className="subjects-table">
                            <caption className="sr-only">
                              درجات وتقديرات مواد السنة {selected.year_label}
                            </caption>
                            <thead>
                              <tr>
                                <th scope="col">المادة</th>
                                <th scope="col">الدرجة</th>
                                <th scope="col">التقييم</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.subjects.map((subject, index) => (
                                <tr key={`${subject.name}-${index}`}>
                                  <th scope="row">
                                    <i />
                                    {subject.name}
                                  </th>
                                  <td dir="ltr">
                                    {numberLabel(Number(subject.score))}
                                  </td>
                                  <td>
                                    <span
                                      className={`rating-badge ${ratingClass(subject.rating)}`}
                                    >
                                      {ratingLabel(subject.rating)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <EmptyState
                            title="لا توجد مواد لهذه السنة"
                            description="اضغط تعديل السنة لإضافة المواد."
                          />
                        )}
                        <div className="details-summary">
                          <span>معدل السنة</span>
                          <strong dir="ltr">
                            {numberLabel(selected.gpa)}
                            <small> / 100</small>
                          </strong>
                        </div>
                      </section>
                      <section className="add-year-panel panel">
                        <button
                          className="primary-button"
                          onClick={add}
                        >
                          <Plus size={18} />
                          إضافة سنة جديدة
                        </button>
                        <GraduationCap size={115} strokeWidth={0.9} />
                        <p>
                          سنة جديدة.
                          <br />
                          <strong>فرصة جديدة للتفوق.</strong>
                        </p>
                        <small dir="ltr">Your progress. Our priority.</small>
                      </section>
                    </div>
                    <PredictionPanel studentId={student.id} latestYearLabel={years.at(-1)?.year_label} />
                    <StudentReportPanel studentId={student.id} studentName={student.student_name} />
                  </>
                )}
              </>
            ) : (
              <section className="panel">
                <EmptyState />
                <button className="primary-button empty-add" onClick={add}>
                  <Plus size={18} />
                  إضافة أول سنة دراسية
                </button>
              </section>
            )}
            <Footer />
            <button
              className="floating-add"
              onClick={add}
              aria-label="إضافة سنة دراسية"
            >
              <Plus size={26} />
            </button>
          </>
        )}
        {saved && (
          <div className="save-toast" role="status">
            <Check size={18} />
            {saved}
            <button
              className="text-button"
              onClick={() => setSaved(null)}
              aria-label="إغلاق إشعار الحفظ"
            >
              ×
            </button>
          </div>
        )}
      </main>
      {modal && student && (
        <AddYearModal
          studentId={student.id}
          existing={modal === "edit" ? selected : undefined}
          close={() => setModal(null)}
          onSaved={(message) => setSaved(message)}
        />
      )}
    </div>
  );
}
