import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET(_request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/reports/students/${studentId}`, { headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(90000) });
    const payload = await response.json().catch(() => null);
    if (payload?.analytics_data && payload?.comprehensive_ai_report) return Response.json(payload);
    if (!response.ok) return Response.json(payload || { message: 'تعذر توليد التقرير' }, { status: response.status || 502 });
    return Response.json(payload);
  } catch { return Response.json({ message: 'خدمة التقارير غير متاحة الآن' }, { status: 502 }); }
}
