import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeacherDetails from '@/features/teacher/components/TeacherDetails';
// Installing the app from a teacher's page opens that same teacher's page.
export async function generateMetadata({ params }: PageProps<'/teachers/[teacherId]'>): Promise<Metadata> {
  const { teacherId } = await params;
  const manifest = /^\d+$/.test(teacherId) ? `/pwa-manifest?start=${encodeURIComponent(`/teachers/${teacherId}`)}` : undefined;
  return { title: 'تفاصيل المعلم | BIG EDUCATION', ...(manifest && { manifest }) };
}
export default async function TeacherPage({ params }: PageProps<'/teachers/[teacherId]'>) { const { teacherId } = await params; if (!/^\d+$/.test(teacherId)) notFound(); return <TeacherDetails teacherId={Number(teacherId)} />; }
