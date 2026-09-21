import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET() {
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/teachers/compare`, { headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: 'تعذر تحميل بيانات المعلمين' }, { status: response.status === 404 ? 404 : 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة بيانات المعلمين غير متاحة الآن' }, { status: 502 }); }
}
