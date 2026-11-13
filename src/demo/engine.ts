// Offline demo backend: answers the same requests as the live API, with the same
// response bodies and status codes, from the captured snapshot plus local logic.
import snapshotFile from './snapshot.json';
import {
  compareStudents,
  compareTeacher,
  gradeEssay,
  manageGrades,
  predict,
  teacherDetail,
  teacherMetaFrom,
  type ApiResult,
  type Performance,
  type StudentComparison,
  type Subject,
  type TeacherComparison,
  type TeacherDetail,
} from './logic';
import { learnedEssayGrade, learnedSaveMessage } from './learned';

type Snapshot = { capturedAt: string; apiBase: string; responses: Record<string, ApiResult> };
export type DemoRequest = { method?: string; path: string; body?: unknown };

const STATE_KEY = 'big-demo-state-v1';
const snapshot = snapshotFile as Snapshot;
export const snapshotCapturedAt = snapshot.capturedAt;

const raw = (path: string) => snapshot.responses[path];
const body = <T>(path: string) => raw(path)?.body as T;
/** Body of a captured successful response only (error samples are not data). */
const found = <T>(path: string) => (raw(path)?.status === 200 ? (raw(path).body as T) : undefined);

const subjects = body<Subject[]>('students/subjects');
const studentsCompare = body<StudentComparison[]>('students/students/compare/');
const teachersCompare = body<TeacherComparison[]>('students/teachers/compare');
const studentOrder = studentsCompare.map(student => student.student_id);
const teacherIds = teachersCompare.map(teacher => teacher.id);
const notFoundStudent = raw('students/students/999999/performance');
const notFoundTeacher = raw('students/teachers/999999');

// ---------- State (edited students only; everything else comes from the snapshot) ----------

type StoredState = { capturedAt: string; students: Record<string, Performance> };
let edited: Map<number, Performance> | null = null;

function loadEdited() {
  if (edited) return edited;
  edited = new Map();
  try {
    const stored = JSON.parse(localStorage.getItem(STATE_KEY) || 'null') as StoredState | null;
    if (stored && stored.capturedAt === snapshot.capturedAt) {
      for (const [id, performance] of Object.entries(stored.students)) edited.set(Number(id), performance);
    }
  } catch { /* storage unavailable: keep edits in memory only */ }
  return edited;
}

function saveEdited() {
  try {
    const students = Object.fromEntries(loadEdited());
    localStorage.setItem(STATE_KEY, JSON.stringify({ capturedAt: snapshot.capturedAt, students } satisfies StoredState));
  } catch { /* storage unavailable */ }
}

/** Restores the original snapshot data (used between visitors at the event). */
export function resetDemoData() {
  edited = new Map();
  try { localStorage.removeItem(STATE_KEY); } catch { /* storage unavailable */ }
}

export const hasDemoEdits = () => loadEdited().size > 0;

function performanceOf(id: number): Performance | undefined {
  return loadEdited().get(id) ?? found<Performance>(`students/students/${id}/performance`);
}

function allPerformances() {
  return new Map(studentOrder.flatMap(id => { const performance = performanceOf(id); return performance ? [[id, performance] as const] : []; }));
}

function knownYears() {
  const years = new Map<string, number>();
  for (const performance of allPerformances().values()) for (const year of performance.history) years.set(year.year_label, year.year_id);
  return years;
}

// ---------- Handlers ----------

const ok = (data: unknown): ApiResult => ({ status: 200, body: data });
const clone = (result: ApiResult): ApiResult => ({ status: result.status, body: structuredClone(result.body) });
const essayQuestions = () => body<{ id: number; question: string; full_mark: number; answer: string }[]>('students/grade-answer/');

function studentPerformance(id: number) {
  const performance = performanceOf(id);
  return performance ? ok(performance) : clone(notFoundStudent);
}

function teacher(id: number) {
  const detail = found<TeacherDetail>(`students/teachers/${id}`);
  if (!detail) return clone(notFoundTeacher);
  return hasDemoEdits() ? ok(teacherDetail(teacherMetaFrom(detail), allPerformances())) : ok(detail);
}

function teachersComparison() {
  if (!hasDemoEdits()) return ok(teachersCompare);
  const performances = allPerformances();
  return ok(teacherIds.map(id => compareTeacher(teacherMetaFrom(body<TeacherDetail>(`students/teachers/${id}`)), performances)));
}

function prediction(studentId: number, year: number) {
  const performance = performanceOf(studentId);
  if (!performance) return clone(notFoundStudent);
  const captured = raw(`students/students/${studentId}/predict/${year}`);
  if (captured && !loadEdited().has(studentId)) return clone(captured);
  // Keep the backend's subject order for this student (taken from any captured prediction).
  const sample = Object.entries(snapshot.responses).find(([path, result]) => path.startsWith(`students/students/${studentId}/predict/`) && result.status === 200);
  const order = (sample?.[1].body as { predictions?: { subject_id: number }[] } | undefined)?.predictions?.map(item => item.subject_id) ?? [];
  return predict(performance, year, order);
}

function report(studentId: number) {
  // The live API answers every id with a report (falls back to the first student's), so do the same.
  return clone(raw(`students/reports/students/${studentId}`) ?? raw(`students/reports/students/${studentOrder[0]}`));
}

function manage(requestBody: unknown) {
  const data = (typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody) as { student_id?: unknown } | null;
  const studentId = Number(data?.student_id);
  const performance = performanceOf(studentId);
  if (!data || !performance) return clone(notFoundStudent);
  const result = manageGrades(performance, data, subjects, knownYears());
  if (!result.performance) return { status: result.status, body: result.body };
  loadEdited().set(studentId, result.performance);
  saveEdited();
  const editing = (data as { academic_year_id?: unknown }).academic_year_id != null;
  const yearId = Number((data as { academic_year_id?: unknown }).academic_year_id);
  const year = editing ? result.performance.history.find(item => item.year_id === yearId) : result.performance.history.at(-1);
  const message = year && learnedSaveMessage(editing ? 'edit' : 'add', year.year_label);
  return { status: result.status, body: message ? { ...(result.body as object), message } : result.body };
}

function gradeAnswer(requestBody: unknown) {
  const data = (typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody) as { question_id?: unknown; student_answer?: unknown } | null;
  const question = essayQuestions().find(item => item.id === Number(data?.question_id));
  if (!question) return { status: 404, body: { detail: 'No EssayQuestion matches the given query.' } };
  const answer = typeof data?.student_answer === 'string' ? data.student_answer : '';
  if (!answer.trim()) return { status: 400, body: { student_answer: ['This field may not be blank.'] } };
  const score = learnedEssayGrade(question.id, answer) ?? gradeEssay(answer, question.answer, question.full_mark);
  return ok({ question_id: question.id, score, full_mark: question.full_mark });
}

// ---------- Router ----------

type Route = { method: string; pattern: RegExp; handle: (match: RegExpMatchArray, body: unknown) => ApiResult; latency: number };
const routes: Route[] = [
  { method: 'GET', pattern: /^students\/students\/compare$/, handle: () => ok(compareStudents(studentOrder, allPerformances())), latency: 350 },
  { method: 'GET', pattern: /^students\/students\/(\d+)\/performance$/, handle: m => studentPerformance(Number(m[1])), latency: 350 },
  { method: 'GET', pattern: /^student\/performance$/, handle: () => studentPerformance(studentOrder[0]), latency: 350 },
  { method: 'GET', pattern: /^students\/students\/(\d+)\/predict\/(\d+)$/, handle: m => prediction(Number(m[1]), Number(m[2])), latency: 700 },
  { method: 'GET', pattern: /^students\/reports\/students\/(\d+)$/, handle: m => report(Number(m[1])), latency: 2500 },
  { method: 'GET', pattern: /^students\/subjects$/, handle: () => ok(subjects), latency: 250 },
  { method: 'POST', pattern: /^students\/grades\/manage$/, handle: (_m, b) => manage(b), latency: 600 },
  { method: 'GET', pattern: /^students\/grade-answer$/, handle: () => ok(essayQuestions()), latency: 300 },
  { method: 'POST', pattern: /^students\/grade-answer$/, handle: (_m, b) => gradeAnswer(b), latency: 1500 },
  { method: 'GET', pattern: /^students\/teachers\/compare$/, handle: () => teachersComparison(), latency: 350 },
  { method: 'GET', pattern: /^students\/teachers\/(\d+)$/, handle: m => teacher(Number(m[1])), latency: 350 },
];

export const normalizePath = (path: string) => path.split('?')[0].replace(/^\/+|\/+$/g, '');

/** Synchronous core, used directly by tests. */
export function resolveDemoRequest({ method = 'GET', path, body: requestBody }: DemoRequest): ApiResult & { latency: number } {
  const clean = normalizePath(path);
  const verb = method.toUpperCase();
  for (const route of routes) {
    const match = clean.match(route.pattern);
    if (match && route.method === verb) {
      try {
        return { ...structuredClone(route.handle(match, requestBody)), latency: route.latency };
      } catch {
        return { status: 400, body: { message: 'بيانات الطلب غير صحيحة' }, latency: 0 };
      }
    }
  }
  return { status: 404, body: { detail: 'Not found.' }, latency: 0 };
}

let latencyEnabled = true;
try { latencyEnabled = new URLSearchParams(location.search).get('latency') !== '0'; } catch { /* not in a browser */ }

/** Async entry point with a realistic delay so loaders behave as they do online. */
export async function handleDemoRequest(request: DemoRequest): Promise<ApiResult> {
  const { latency, ...result } = resolveDemoRequest(request);
  if (latencyEnabled && latency) await new Promise(resolve => setTimeout(resolve, latency));
  return result;
}
