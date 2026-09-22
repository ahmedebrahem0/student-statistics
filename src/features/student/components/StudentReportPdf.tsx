import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { StudentReport } from '../types/student.types';

Font.register({
  family: 'Cairo',
  fonts: [
    { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf', fontWeight: 400 },
    { src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/Cairo%5Bslnt%2Cwght%5D.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { fontFamily: 'Cairo', direction: 'rtl', padding: 28, fontSize: 10, color: '#0b2e30', backgroundColor: '#ffffff' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #3b928c', paddingBottom: 12, marginBottom: 16 },
  headerText: { textAlign: 'right' },
  companyName: { fontSize: 16, fontWeight: 700, color: '#0f5f5a' },
  companyTag: { fontSize: 8, color: '#5a7c78', marginTop: 2 },
  logo: { width: 90, height: 50, objectFit: 'contain' },
  title: { fontSize: 14, fontWeight: 700, color: '#0f5f5a', textAlign: 'right', marginBottom: 3 },
  meta: { fontSize: 8, color: '#5a7c78', textAlign: 'right', marginBottom: 14 },
  section: { marginBottom: 12, padding: 10, borderRadius: 6, backgroundColor: '#f2f8f7', border: '1px solid #d5e8e5' },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#0f5f5a', textAlign: 'right', marginBottom: 6 },
  text: { fontSize: 9, lineHeight: 1.6, textAlign: 'right', color: '#243b3a' },
  listItem: { fontSize: 9, lineHeight: 1.6, textAlign: 'right', color: '#243b3a', marginBottom: 3 },
  row: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 8, backgroundColor: '#e3f3f0', color: '#0f5f5a', padding: '4 8', borderRadius: 10, border: '1px solid #b9dcd6' },
  table: { border: '1px solid #d5e8e5', borderRadius: 6, overflow: 'hidden' },
  tableRow: { flexDirection: 'row-reverse', borderBottom: '1px solid #d5e8e5' },
  tableCellHead: { flex: 1, fontSize: 8, fontWeight: 700, color: '#0f5f5a', backgroundColor: '#e3f3f0', padding: 6, textAlign: 'right' },
  tableCell: { flex: 1, fontSize: 8, color: '#243b3a', padding: 6, textAlign: 'right' },
  badge: { fontSize: 8, fontWeight: 700, padding: '2 6', borderRadius: 4, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 18, left: 28, right: 28, textAlign: 'center', fontSize: 7, color: '#7fa39e', borderTop: '1px solid #e0eeec', paddingTop: 6 }
});

function masteryColor(level: string) {
  if (level.includes('عاجل')) return { backgroundColor: '#fbe0da', color: '#a1462f' };
  if (level.includes('متوسط')) return { backgroundColor: '#fbf0d3', color: '#8a6a1c' };
  if (level.includes('متقدم')) return { backgroundColor: '#d9f3e3', color: '#1c8a57' };
  return { backgroundColor: '#e3f3f0', color: '#0f5f5a' };
}

export default function StudentReportPdf({ data }: { data: StudentReport }) {
  const { analytics_data: analytics, comprehensive_ai_report: report } = data;
  return <Document title={`تقرير ${analytics.student_name}`}>
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.companyName}>BIG EDUCATION</Text>
          <Text style={styles.companyTag}>رحلتك الدراسية في مكان واحد</Text>
        </View>
        <Image src="/image/test.png" style={styles.logo} />
      </View>

      <Text style={styles.title}>{report.report_title}</Text>
      <Text style={styles.meta}>{analytics.student_name}  •  {report.report_metadata.analysis_span}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الملخص التنفيذي</Text>
        <Text style={styles.text}>{report.executive_summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تحليل المسار الأكاديمي</Text>
        <Text style={styles.text}>{report.academic_trajectory_analysis}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المؤشرات السلوكية والنفسية</Text>
        <Text style={styles.text}>{report.behavioral_and_psychological_indicators}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تقييم المخاطر — {report.risk_assessment.risk_level}</Text>
        {report.risk_assessment.identified_risks.map((item, index) => <Text key={index} style={styles.listItem}>• {item}</Text>)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أداء المواد</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCellHead}>المادة</Text>
            <Text style={styles.tableCellHead}>المتوسط</Text>
            <Text style={styles.tableCellHead}>أعلى/أدنى درجة</Text>
          </View>
          {analytics.subject_performance.map((subject, index) => <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{subject.subject__name}</Text>
            <Text style={styles.tableCell}>{subject.overall_avg}</Text>
            <Text style={styles.tableCell}>{subject.highest_score} – {subject.lowest_score}</Text>
          </View>)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>المعلمون</Text>
        <View style={styles.row}>
          {analytics.teachers.map((teacher, index) => <Text key={index} style={styles.chip}>{teacher.name} • {teacher.subject}</Text>)}
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>تشخيص المواد</Text>
        {report.subject_diagnostics.map((subject, index) => <View key={index} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: index < report.subject_diagnostics.length - 1 ? '1px solid #e0eeec' : 'none' }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#0f5f5a' }}>{subject.subject_name}</Text>
            <Text style={[styles.badge, masteryColor(subject.mastery_level)]}>{subject.mastery_level}</Text>
          </View>
          <Text style={styles.text}>الفجوة: {subject.gap_analysis}</Text>
          <Text style={styles.text}>أسلوب المذاكرة: {subject.suggested_study_technique}</Text>
        </View>)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خطط عمل المعلمين</Text>
        {report.teacher_action_plans.map((plan, index) => <View key={index} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9.5, fontWeight: 700, color: '#0f5f5a', textAlign: 'right' }}>{plan.teacher_name} — {plan.subject}</Text>
          <Text style={styles.text}>{plan.pedagogical_strategy}</Text>
        </View>)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>إرشادات لولي الأمر</Text>
        {report.parental_guidance.map((item, index) => <Text key={index} style={styles.listItem}>• {item}</Text>)}
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>خارطة طريق التنفيذ</Text>
        {report.implementation_roadmap.map((phase, index) => <View key={index} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 9.5, fontWeight: 700, color: '#0f5f5a', textAlign: 'right' }}>{index + 1}. {phase.phase_name}</Text>
          {phase.action_items.map((item, itemIndex) => <Text key={itemIndex} style={styles.listItem}>• {item}</Text>)}
        </View>)}
      </View>

      <View style={[styles.section, { backgroundColor: '#e3f3f0' }]}>
        <Text style={styles.sectionTitle}>الخلاصة الاستشارية</Text>
        <Text style={styles.text}>{report.quality_consultant_final_verdict}</Text>
      </View>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => `BIG EDUCATION — تقرير آلي مولّد بالذكاء الاصطناعي — صفحة ${pageNumber} من ${totalPages}`} fixed />
    </Page>
  </Document>;
}
