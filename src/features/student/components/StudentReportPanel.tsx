'use client';
import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { AlertCircle, AlertTriangle, BookOpen, ClipboardList, FileText, HeartHandshake, Map, Sparkles, TrendingUp, Users, Brain, LineChart } from 'lucide-react';
import { useLazyGetStudentReportQuery } from '../api/studentApi';
import { numberLabel, replaceStudentNameInReport } from '../utils/student.utils';
import ReportYearlyChart from './charts/ReportYearlyChart';
import ReportSubjectChart from './charts/ReportSubjectChart';

const StudentReportDownloadButton = dynamic(() => import('./StudentReportDownloadButton'), { ssr: false });

function masteryClass(level: string) {
  if (level.includes('عاجل')) return 'mastery-critical';
  if (level.includes('متوسط')) return 'mastery-medium';
  if (level.includes('متقدم')) return 'mastery-advanced';
  return '';
}

export default function StudentReportPanel({ studentId, studentName }: { studentId: number; studentName: string }) {
  const [trigger, { data, isFetching, isError }] = useLazyGetStudentReportQuery();
  const resultRef = useRef<HTMLDivElement>(null);
  const generate = () => {
    trigger(studentId).then(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };
  const report = data && replaceStudentNameInReport(data.comprehensive_ai_report, data.analytics_data.student_name, studentName);
  const analytics = data && { ...data.analytics_data, student_name: studentName };
  const reportData = data && { analytics_data: analytics!, comprehensive_ai_report: report! };

  return <section className="chart-panel panel report-panel" aria-label="تقرير الطالب الذكي">
    <div className="section-heading">
      <h2><FileText size={16} />تقرير الطالب الذكي</h2>
      <span className="chart-subtitle">تحليل شامل مدعوم بالذكاء الاصطناعي</span>
    </div>
    <div className="report-actions">
      <button className="primary-button" onClick={generate} disabled={isFetching}>
        <Sparkles size={16} />{isFetching ? 'جارٍ توليد التقرير...' : 'توليد التقرير'}
      </button>
      {reportData && <StudentReportDownloadButton data={reportData} />}
    </div>
    {isError && <p className="field-error" role="alert"><AlertCircle size={14} />تعذر توليد التقرير حاليًا، حاول مرة أخرى بعد قليل.</p>}
    {data && report && analytics && <div className="report-result" ref={resultRef}>

      {/*
      <div className="chart-panel report-chart-block report-block">
        <h3 className="report-block-title"><TrendingUp size={15} />الأداء عبر السنوات</h3>
        <ReportYearlyChart years={analytics.yearly_performance} />
        <div className="report-year-grid">
          {analytics.yearly_performance.map((year, index) => <div key={index} className="report-year-card">
            <span dir="ltr">{year.academic_year__year}</span>
            <strong dir="ltr">{numberLabel(year.avg_score)}</strong>
            <small dir="ltr">{numberLabel(year.min_score)} – {numberLabel(year.max_score)}</small>
          </div>)}
        </div>
      </div>
      */}

      <div className="chart-panel report-chart-block report-block">
        <h3 className="report-block-title"><BookOpen size={15} />أداء المواد</h3>
        <ReportSubjectChart subjects={analytics.subject_performance} />
        <div className="report-subject-grid" dir="ltr" style={{ gridTemplateColumns: `repeat(${analytics.subject_performance.length}, minmax(0, 1fr))` }}>
          {analytics.subject_performance.map((subject, index) => <div key={index} className="report-subject-card">
            <span dir="rtl">{subject.subject__name}</span>
            <strong dir="ltr">{numberLabel(subject.overall_avg)}</strong>
            <small dir="ltr">{numberLabel(subject.lowest_score)} – {numberLabel(subject.highest_score)}</small>
          </div>)}
        </div>
      </div>

      <div className="report-block">
        <h3 className="report-block-title"><Users size={15} />المعلمون</h3>
        <div className="report-teacher-list">
          {analytics.teachers.map((teacher, index) => <span key={index} className="report-teacher-chip">{teacher.name} <i>•</i> {teacher.subject}</span>)}
        </div>
      </div>

      <div className="report-summary-card report-block">
        <h3 className="report-block-title"><FileText size={15} />{report.report_title}</h3>
        <span className="chart-subtitle" style={{ display: 'inline' }}>{report.report_metadata.analysis_span}</span>
        <p>{report.executive_summary}</p>
      </div>
      <div className="report-trajectory-card report-block">
        <h3 className="report-block-title"><LineChart size={15} />تحليل المسار الأكاديمي</h3>
        <p>{report.academic_trajectory_analysis}</p>
      </div>
      <div className="report-behavioral-card report-block">
        <h3 className="report-block-title"><Brain size={15} />المؤشرات السلوكية والنفسية</h3>
        <p>{report.behavioral_and_psychological_indicators}</p>
      </div>
      <div className="report-risk-card report-block">
        <h3 className="report-block-title"><AlertTriangle size={15} />تقييم المخاطر — {report.risk_assessment.risk_level}</h3>
        <ul className="report-list">{report.risk_assessment.identified_risks.map((item, index) => <li key={index}>{item}</li>)}</ul>
        <h4 className="report-subheading">إجراءات وقائية</h4>
        <ul className="report-list">{report.risk_assessment.preventive_measures.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>
      <div className="details-panel report-block">
        <h3 className="report-block-title">تشخيص المواد</h3>
        <div className="report-diagnostic-list">
          {report.subject_diagnostics.map((subject, index) => <div key={index} className="report-diagnostic-card">
            <div className="report-diagnostic-head">
              <strong>{subject.subject_name}</strong>
              <span className={`rating-badge ${masteryClass(subject.mastery_level)}`}>{subject.mastery_level}</span>
            </div>
            <p><b>المسار:</b> {subject.historical_trajectory}</p>
            <p><b>الفجوة:</b> {subject.gap_analysis}</p>
            <p><b>أسلوب المذاكرة:</b> {subject.suggested_study_technique}</p>
            <p><b>ساعات أسبوعية مقترحة:</b> <span dir="ltr">{subject.weekly_hours_needed}</span></p>
          </div>)}
        </div>
      </div>
      <div className="details-panel report-block">
        <h3 className="report-block-title"><Users size={15} />خطط عمل المعلمين</h3>
        <div className="report-teacher-plan-grid">
          {report.teacher_action_plans.map((plan, index) => <div key={index} className="report-teacher-plan-card">
            <div className="report-diagnostic-head">
              <strong>{plan.teacher_name}</strong>
              <span className="rating-badge" dir="ltr">{plan.subject}</span>
            </div>
            <p><b>الملاحظة التشخيصية:</b> {plan.diagnostic_observation}</p>
            <p><b>الاستراتيجية التربوية:</b> {plan.pedagogical_strategy}</p>
            <p><b>آلية المتابعة:</b> {plan.feedback_loop_mechanism}</p>
          </div>)}
        </div>
      </div>
      <div className="report-guidance-card report-block">
        <h3 className="report-block-title"><HeartHandshake size={15} />إرشادات لولي الأمر</h3>
        <ul className="report-list">{report.parental_guidance.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>
      <div className="report-roadmap-panel report-block">
        <h3 className="report-block-title"><Map size={15} />خارطة طريق التنفيذ</h3>
        <div className="report-roadmap-grid">
          {report.implementation_roadmap.map((phase, index) => <div key={index} className={`report-roadmap-card report-roadmap-card-${index % 3}`}>
            <span className="report-roadmap-number">{index + 1}</span>
            <strong>{phase.phase_name}</strong>
            <h5 className="report-roadmap-label">الأهداف</h5>
            <ul className="report-list">{phase.goals.map((goal, goalIndex) => <li key={goalIndex}>{goal}</li>)}</ul>
            <h5 className="report-roadmap-label">إجراءات التنفيذ</h5>
            <ul className="report-list">{phase.action_items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>
          </div>)}
        </div>
      </div>
      <div className="report-verdict-card report-block">
        <h3 className="report-block-title"><ClipboardList size={15} />الخلاصة الاستشارية</h3>
        <p>{report.quality_consultant_final_verdict}</p>
      </div>
    </div>}
  </section>;
}
