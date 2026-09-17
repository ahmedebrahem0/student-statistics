export async function GET() {
  try {
    const response = await fetch(process.env.STUDENT_API_URL || 'https://grindable-unplumb-jacoby.ngrok-free.dev/api/students/1/performance', { headers: { 'ngrok-skip-browser-warning': 'true', Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) return Response.json({ message: 'تعذر الاتصال بخدمة بيانات الطالب' }, { status: 502 });
    return Response.json(await response.json());
  } catch { return Response.json({ message: 'خدمة بيانات الطالب غير متاحة الآن' }, { status: 502 }); }
}
