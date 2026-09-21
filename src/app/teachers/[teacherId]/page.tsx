import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeacherDetails from '@/features/teacher/components/TeacherDetails';
export const metadata: Metadata = { title: 'تفاصيل المعلم | BIG EDUCATION' };
export default async function TeacherPage({ params }: PageProps<'/teachers/[teacherId]'>) { const { teacherId } = await params; if (!/^\d+$/.test(teacherId)) notFound(); return <TeacherDetails teacherId={Number(teacherId)} />; }
