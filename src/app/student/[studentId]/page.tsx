import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentOverview from '@/features/student/components/StudentOverview';
// Installing the app from a student's page opens that same student's page.
export async function generateMetadata({ params }: PageProps<'/student/[studentId]'>): Promise<Metadata> {
  const { studentId } = await params;
  return /^\d+$/.test(studentId) ? { manifest: `/pwa-manifest?start=${encodeURIComponent(`/student/${studentId}`)}` } : {};
}
export default async function Page({ params }: PageProps<'/student/[studentId]'>) {
  const { studentId } = await params;
  if (!/^\d+$/.test(studentId)) notFound();
  return <StudentOverview studentId={Number(studentId)} />;
}
