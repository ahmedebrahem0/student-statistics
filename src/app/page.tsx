import type { Metadata } from 'next';
import TeachersOverview from '@/features/teacher/components/TeachersOverview';
export const metadata: Metadata = { title: 'تحليلات المعلمين | BIG EDUCATION', description: 'مقارنة الأداء الأكاديمي للمعلمين عبر السنوات.' };
export default function Page() { return <TeachersOverview />; }
