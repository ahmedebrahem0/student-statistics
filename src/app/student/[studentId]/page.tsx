import { notFound } from 'next/navigation';
import StudentOverview from '@/features/student/components/StudentOverview';
export default async function Page({ params }: PageProps<'/student/[studentId]'>) {
  const { studentId } = await params;
  if (!/^\d+$/.test(studentId)) notFound();
  return <StudentOverview studentId={Number(studentId)} />;
}
