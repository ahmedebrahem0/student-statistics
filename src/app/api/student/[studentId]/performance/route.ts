import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
export async function GET(_request: Request, { params }: RouteContext<'/api/student/[studentId]/performance'>) {
  const { studentId } = await params;
  if (!/^\d+$/.test(studentId)) return Response.json({ message: 'معرّف الطالب غير صالح' }, { status: 400 });
  try {
    const response = await fetch(`${STUDENT_API_BASE_URL}/students/students/${studentId}/performance`, { headers: { Accept: 'application/json', 'ngrok-skip-browser-warning': 'true' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: response.status === 404 ? 'الطالب غير موجود' : 'تعذر تحميل بيانات الطالب' }, { status: response.status === 404 ? 404 : 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة بيانات الطالب غير متاحة الآن' }, { status: 502 }); }
}
