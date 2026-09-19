import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET() {
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/1/performance`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: 'تعذر الاتصال بخدمة بيانات الطالب' }, { status: 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة بيانات الطالب غير متاحة الآن' }, { status: 502 }); }
}
