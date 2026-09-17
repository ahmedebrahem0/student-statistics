import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET() {
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/subjects`, { headers: { 'ngrok-skip-browser-warning': 'true', Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: 'تعذر تحميل قائمة المواد' }, { status: 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة المواد الدراسية غير متاحة الآن' }, { status: 502 }); }
}
