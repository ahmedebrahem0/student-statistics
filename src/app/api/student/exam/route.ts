import { NextResponse } from "next/server";
import {
  gradeEssayRequestSchema,
  upstreamEssayGradeSchema,
  upstreamEssayQuestionsSchema,
} from "@/features/student/schema/exam.schema";
import { STUDENT_API_BASE_URL } from "@/shared/constants/api-endpoints";

const UPSTREAM_URL = `${STUDENT_API_BASE_URL}/students/grade-answer/`;
const TIMEOUT_MS = 12_000;
const responseHeaders = { "Cache-Control": "no-store" };

async function fetchUpstream(init?: RequestInit) {
  return fetch(UPSTREAM_URL, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", ...init?.headers },
  });
}

function errorResponse(message: string, status = 502) {
  return NextResponse.json({ error: message }, { status, headers: responseHeaders });
}

export async function GET() {
  try {
    const response = await fetchUpstream();
    if (!response.ok) return errorResponse("تعذر تحميل سؤال المقال الآن. حاول مرة أخرى.");
    const questions = upstreamEssayQuestionsSchema.safeParse(await response.json());
    if (!questions.success) return errorResponse("بيانات سؤال المقال غير مكتملة.");
    const question = questions.data[0];
    return NextResponse.json(
      { id: question.id, question: question.question, fullMark: question.full_mark },
      { headers: responseHeaders },
    );
  } catch {
    return errorResponse("تعذر الاتصال بخدمة الامتحان. تحقق من الإنترنت وحاول مجددًا.");
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("بيانات الإجابة غير صحيحة.", 400);
  }
  const parsed = gradeEssayRequestSchema.safeParse(body);
  if (!parsed.success) return errorResponse("يجب كتابة إجابة السؤال المقالي قبل التسليم.", 400);

  try {
    const gradeResponse = await fetchUpstream({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: parsed.data.questionId,
        student_answer: parsed.data.studentAnswer,
      }),
    });
    if (!gradeResponse.ok) return errorResponse("لم نتمكن من تقييم الإجابة. إجاباتك محفوظة ويمكنك المحاولة مجددًا.", gradeResponse.status >= 500 ? 502 : 400);
    const grade = upstreamEssayGradeSchema.safeParse(await gradeResponse.json());
    if (!grade.success) return errorResponse("وصلت نتيجة غير مكتملة من خدمة التصحيح.");
    if (grade.data.question_id !== parsed.data.questionId) return errorResponse("وصلت نتيجة لسؤال مختلف. حاول التسليم مجددًا.");
    if (grade.data.full_mark !== 20) return errorResponse("الدرجة الكاملة للسؤال المقالي غير صحيحة.");

    const questionsResponse = await fetchUpstream();
    if (!questionsResponse.ok) return errorResponse("تم التصحيح لكن تعذر تحميل نموذج الإجابة. حاول التسليم مجددًا.");
    const questions = upstreamEssayQuestionsSchema.safeParse(await questionsResponse.json());
    if (!questions.success) return errorResponse("تم التصحيح لكن نموذج الإجابة غير متاح.");
    const question = questions.data.find((item) => item.id === grade.data.question_id);
    if (!question) return errorResponse("تعذر مطابقة نتيجة السؤال المقالي.");

    return NextResponse.json({
      questionId: grade.data.question_id,
      score: Math.min(grade.data.score, grade.data.full_mark),
      fullMark: grade.data.full_mark,
      modelAnswer: question.answer,
    }, { headers: responseHeaders });
  } catch {
    return errorResponse("تعذر الاتصال بخدمة التصحيح. إجاباتك محفوظة ويمكنك إعادة المحاولة.");
  }
}
