import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET(_request: Request, { params }: { params: Promise<{ studentId: string; year: string }> }) {
  const { studentId, year } = await params;
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/predict/${studentId}/${year}`, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return Response.json(payload || { message: 'تعذر توليد التوقع' }, { status: response.status || 502 });
    return Response.json(payload);
  } catch { return Response.json({ message: 'خدمة التوقع غير متاحة الآن' }, { status: 502 }); }
}
