import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/grades/manage`, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return Response.json(payload || { message: 'تعذر حفظ الدرجات' }, { status: response.status || 502 });
    return Response.json(payload);
  } catch { return Response.json({ message: 'خدمة حفظ الدرجات غير متاحة الآن' }, { status: 502 }); }
}
