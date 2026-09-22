'use client';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import type { StudentReport } from '../types/student.types';
import StudentReportPdf from './StudentReportPdf';

export default function StudentReportDownloadButton({ data }: { data: StudentReport }) {
  return <PDFDownloadLink document={<StudentReportPdf data={data} />} fileName={`تقرير-${data.analytics_data.student_name}.pdf`} className="secondary-button">
    {({ loading }) => <><Download size={16} />{loading ? 'جارٍ تجهيز الملف...' : 'تحميل PDF'}</>}
  </PDFDownloadLink>;
}
