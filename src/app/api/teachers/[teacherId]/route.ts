import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET(_request: Request, { params }: RouteContext<'/api/teachers/[teacherId]'>) {
  const { teacherId } = await params;
  if (!/^\d+$/.test(teacherId)) return Response.json({ message: 'معرّف المعلم غير صالح' }, { status: 400 });
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/teachers/${teacherId}`, { headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: response.status === 404 ? 'المعلم غير موجود' : 'تعذر تحميل بيانات المعلم' }, { status: response.status === 404 ? 404 : 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة بيانات المعلمين غير متاحة الآن' }, { status: 502 }); }
}
