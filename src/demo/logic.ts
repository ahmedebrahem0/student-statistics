// Pure demo-mode logic: re-implements the backend calculations so the offline demo
// returns exactly what the live API would. Every formula here is verified against
// the captured snapshot in src/demo/engine.test.mjs.

export type Rating = 'Excellent' | 'Very Good' | 'Good' | 'Pass' | 'Fail';

export type SubjectScore = { subject_id: number; subject_name: string; score: number; rating: string };
export type YearRecord = { year_id: number; year_label: string; gpa: number; subjects: SubjectScore[] };
export type Performance = { student_id: number; student_name: string; history: YearRecord[] };

export type StudentComparison = {
  student_id: number;
  student_name: string;
  overall_gpa: number;
  overall_rating: string;
  yearly_performance: { year_id: number; year_label: string; gpa: number; rating: string }[];
};

export type TeacherDetail = {
  id: number;
  name: string;
  is_general: boolean;
  subject: string;
  overall_performance: number;
  total_students: number;
  students: { student_id: number; student_name: string; chart_data: { year: string; gpa: number; rating: string }[] }[];
};

export type TeacherComparison = {
  id: number;
  name: string;
  is_general: boolean;
  subject: string;
  yearly_performance: { year_id: number; year_label: string; avg_score: number; rating: string; students_count: number }[];
};

export type Subject = { id: number; name: string };
export type ApiResult = { status: number; body: unknown };

// Same thresholds as the backend (and ratingFor in student.utils).
export const ratingFor = (score: number): Rating =>
  score >= 85 ? 'Excellent' : score >= 75 ? 'Very Good' : score >= 65 ? 'Good' : score >= 50 ? 'Pass' : 'Fail';

export const round1 = (value: number) => Math.round(value * 10) / 10;
export const round2 = (value: number) => Math.round(value * 100) / 100;
const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

/** "2023-2024" → 2023 (the backend's "recorded year" is the start year). */
export const startYear = (label: string) => Number(label.slice(0, 4));

// ---------- Students ----------

export function compareStudents(order: number[], performances: Map<number, Performance>): StudentComparison[] {
  return order
    .map(id => performances.get(id))
    .filter((performance): performance is Performance => Boolean(performance))
    .map(performance => {
      const yearly = performance.history.map(year => ({ year_id: year.year_id, year_label: year.year_label, gpa: year.gpa, rating: ratingFor(year.gpa) }));
      const overall = round2(average(yearly.map(year => year.gpa)));
      return { student_id: performance.student_id, student_name: performance.student_name, overall_gpa: overall, overall_rating: ratingFor(overall), yearly_performance: yearly };
    });
}

// ---------- Teachers ----------

type TeacherMeta = Omit<TeacherDetail, 'overall_performance' | 'total_students' | 'students'> & { studentOrder: number[] };

function teacherScore(teacher: TeacherMeta, year: YearRecord) {
  if (teacher.is_general) return year.gpa;
  return year.subjects.find(subject => subject.subject_name === teacher.subject)?.score;
}

export function teacherDetail(teacher: TeacherMeta, performances: Map<number, Performance>): TeacherDetail {
  const students = teacher.studentOrder
    .map(id => performances.get(id))
    .filter((performance): performance is Performance => Boolean(performance))
    .map(performance => ({
      student_id: performance.student_id,
      student_name: performance.student_name,
      chart_data: performance.history.flatMap(year => {
        const score = teacherScore(teacher, year);
        return score === undefined ? [] : [{ year: year.year_label, gpa: score, rating: ratingFor(score) }];
      }),
    }));
  const allScores = students.flatMap(student => student.chart_data.map(point => point.gpa));
  return {
    id: teacher.id,
    name: teacher.name,
    is_general: teacher.is_general,
    subject: teacher.subject,
    overall_performance: round2(average(allScores)),
    total_students: students.length,
    students,
  };
}

export function compareTeacher(teacher: TeacherMeta, performances: Map<number, Performance>): TeacherComparison {
  const years = new Map<number, string>();
  for (const id of teacher.studentOrder) for (const year of performances.get(id)?.history ?? []) years.set(year.year_id, year.year_label);
  const detail = teacherDetail(teacher, performances);
  const yearly = [...years]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([yearId, label]) => {
      const scores = detail.students.flatMap(student => student.chart_data.filter(point => point.year === label).map(point => point.gpa));
      const avg = round2(average(scores));
      return { year_id: yearId, year_label: label, avg_score: avg, rating: ratingFor(avg), students_count: scores.length };
    })
    .filter(year => year.students_count > 0);
  return { id: teacher.id, name: teacher.name, is_general: teacher.is_general, subject: teacher.subject, yearly_performance: yearly };
}

export function teacherMetaFrom(detail: TeacherDetail): TeacherMeta {
  return { id: detail.id, name: detail.name, is_general: detail.is_general, subject: detail.subject, studentOrder: detail.students.map(student => student.student_id) };
}

// ---------- Prediction (per-subject least-squares linear trend, clamped 0–100) ----------

export function predict(performance: Performance, targetYear: number, subjectOrder: number[] = []): ApiResult {
  if (!performance.history.length) return { status: 400, body: { error: 'لا توجد سنوات مسجلة للطالب لتوليد التوقع.' } };
  const latest = Math.max(...performance.history.map(year => startYear(year.year_label)));
  if (targetYear <= latest) return { status: 400, body: { error: `سنة التوقع يجب أن تكون أكبر من آخر سنة مسجلة للطالب (${latest}).` } };

  const series = new Map<number, { name: string; points: [number, number][] }>();
  for (const year of performance.history) {
    for (const subject of year.subjects) {
      if (!series.has(subject.subject_id)) series.set(subject.subject_id, { name: subject.subject_name, points: [] });
      series.get(subject.subject_id)!.points.push([startYear(year.year_label), subject.score]);
    }
  }
  const rank = (id: number) => { const index = subjectOrder.indexOf(id); return index === -1 ? Number.MAX_SAFE_INTEGER : index; };
  const ids = [...series.keys()].sort((a, b) => rank(a) - rank(b));

  const predictions = ids.map(id => {
    const { name, points } = series.get(id)!;
    const meanX = average(points.map(point => point[0]));
    const meanY = average(points.map(point => point[1]));
    const sxx = points.reduce((sum, [x]) => sum + (x - meanX) ** 2, 0);
    const sxy = points.reduce((sum, [x, y]) => sum + (x - meanX) * (y - meanY), 0);
    const slope = sxx ? sxy / sxx : 0;
    const value = round1(Math.min(100, Math.max(0, meanY + slope * (targetYear - meanX))));
    return { subject_id: id, subject_name: name, predicted_score: value, rating: ratingFor(value) };
  });
  const predictedGpa = round2(average(predictions.map(prediction => prediction.predicted_score)));
  return {
    status: 200,
    body: {
      student_id: performance.student_id,
      student_name: performance.student_name,
      latest_recorded_year: latest,
      target_year: targetYear,
      predicted_gpa: predictedGpa,
      predictions,
    },
  };
}

// ---------- Add / edit an academic year ----------

export type ManageGradesBody = { student_id?: unknown; academic_year_id?: unknown; grades?: unknown };

export function manageGrades(
  performance: Performance,
  body: ManageGradesBody,
  subjects: Subject[],
  knownYears: Map<string, number>,
): ApiResult & { performance?: Performance } {
  const grades = Array.isArray(body.grades) ? body.grades : [];
  if (!grades.length) return { status: 400, body: { message: 'أضف مادة واحدة على الأقل' } };
  const parsed: { subject_id: number; score: number }[] = [];
  for (const grade of grades) {
    const subjectId = Number((grade as { subject_id?: unknown })?.subject_id);
    const score = Number((grade as { score?: unknown })?.score);
    if (!subjects.some(subject => subject.id === subjectId)) return { status: 400, body: { message: 'مادة غير معروفة' } };
    if (!Number.isFinite(score) || score < 0 || score > 100) return { status: 400, body: { message: 'أدخل درجة من 0 إلى 100' } };
    parsed.push({ subject_id: subjectId, score: round2(score) });
  }
  const subjectName = (id: number) => subjects.find(subject => subject.id === id)!.name;
  const toScore = (grade: { subject_id: number; score: number }): SubjectScore => ({
    subject_id: grade.subject_id,
    subject_name: subjectName(grade.subject_id),
    score: grade.score,
    rating: ratingFor(grade.score),
  });
  const withGpa = (year: Omit<YearRecord, 'gpa'>): YearRecord => ({ ...year, gpa: round2(average(year.subjects.map(subject => subject.score))) });

  const history = performance.history.map(year => ({ ...year, subjects: [...year.subjects] }));
  const yearId = body.academic_year_id === undefined || body.academic_year_id === null ? null : Number(body.academic_year_id);
  let message: string;

  if (yearId !== null) {
    const index = history.findIndex(year => year.year_id === yearId);
    if (index === -1) return { status: 404, body: { message: 'السنة الدراسية غير موجودة لهذا الطالب' } };
    const subjectsOfYear = [...history[index].subjects];
    for (const grade of parsed) {
      const existing = subjectsOfYear.findIndex(subject => subject.subject_id === grade.subject_id);
      if (existing === -1) subjectsOfYear.push(toScore(grade));
      else subjectsOfYear[existing] = toScore(grade);
    }
    history[index] = withGpa({ year_id: history[index].year_id, year_label: history[index].year_label, subjects: subjectsOfYear });
    message = `تم تحديث درجات السنة الدراسية ${history[index].year_label} بنجاح`;
  } else {
    const latest = history.length ? Math.max(...history.map(year => startYear(year.year_label))) : new Date().getFullYear() - 1;
    const label = `${latest + 1}-${latest + 2}`;
    const id = knownYears.get(label) ?? Math.max(0, ...knownYears.values()) + 1;
    const unique = parsed.filter((grade, index) => parsed.findIndex(other => other.subject_id === grade.subject_id) === index);
    history.push(withGpa({ year_id: id, year_label: label, subjects: unique.map(toScore) }));
    message = `تمت إضافة السنة الدراسية ${label} بنجاح`;
  }

  const updated: Performance = { student_id: performance.student_id, student_name: performance.student_name, history };
  return { status: 200, body: { message, data: updated }, performance: updated };
}

// ---------- Essay grading (offline stand-in for the AI grader) ----------

const STOP_WORDS = new Set(['في', 'من', 'إلى', 'الى', 'على', 'عن', 'مع', 'أن', 'ان', 'إن', 'التي', 'الذي', 'هذا', 'هذه', 'ذلك', 'تلك', 'كما', 'أو', 'او', 'ثم', 'قد', 'لقد', 'كان', 'كانت', 'هو', 'هي', 'بين', 'حتى', 'بعد', 'قبل', 'عند', 'كل', 'ما', 'لا', 'لم', 'لن', 'و']);

export function normalizeArabic(text: string) {
  return text
    .replace(/[ً-ْٰـ]/g, '') // diacritics + tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^ء-ي0-9a-zA-Z\s]/g, ' ')
    .toLowerCase();
}

function stem(word: string) {
  let result = word;
  for (const prefix of ['وال', 'بال', 'كال', 'فال', 'لل', 'ال']) {
    if (result.startsWith(prefix) && result.length - prefix.length >= 3) { result = result.slice(prefix.length); break; }
  }
  if (result.length > 4 && (result.startsWith('و') || result.startsWith('ب') || result.startsWith('ل'))) result = result.slice(1);
  for (const suffix of ['ات', 'ون', 'ين', 'ها', 'هم', 'ه', 'ي']) {
    if (result.endsWith(suffix) && result.length - suffix.length >= 3) { result = result.slice(0, -suffix.length); break; }
  }
  return result;
}

export function keywords(text: string) {
  return new Set(
    normalizeArabic(text)
      .split(/\s+/)
      .filter(word => word.length >= 3 && !STOP_WORDS.has(word))
      .map(stem),
  );
}

/** Deterministic score out of `fullMark` from how much of the model answer's content the student covered. */
export function gradeEssay(studentAnswer: string, modelAnswer: string, fullMark = 20) {
  const expected = keywords(modelAnswer);
  const given = keywords(studentAnswer);
  if (!expected.size || !given.size) return 0;
  let matched = 0;
  for (const word of expected) if (given.has(word)) matched++;
  // A complete answer rarely repeats every word of the model answer: full marks at ~60% coverage.
  const coverage = Math.min(1, matched / expected.size / 0.6);
  return Math.round(coverage * fullMark * 2) / 2;
}
