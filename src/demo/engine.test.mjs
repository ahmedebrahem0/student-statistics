import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test, { beforeEach } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const snapshot = JSON.parse(readFileSync(new URL('./snapshot.json', import.meta.url), 'utf8'));

function compile(file, dependencies = {}, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => dependencies[name] ?? require(name), structuredClone, URLSearchParams, setTimeout, ...globals });
  return exports;
}

const storage = new Map();
const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
const logic = compile('./logic.ts');
const learned = compile('./learned.ts', {}, { localStorage });
const engine = compile('./engine.ts', { './learned': learned, './logic': logic, './snapshot.json': { __esModule: true, default: snapshot } }, { localStorage });
const studentSchemas = compile('../features/student/schema/student.schema.ts');
const teacherSchemas = compile('../features/teacher/schema/teacher.schema.ts');
const examSchemas = compile('../features/student/schema/exam.schema.ts');

const call = (path, method = 'GET', body) => {
  const { status, body: responseBody } = engine.resolveDemoRequest({ method, path, body });
  return JSON.parse(JSON.stringify({ status, body: responseBody }));
};
const studentIds = snapshot.responses['students/students/compare/'].body.map(student => student.student_id);
const teacherIds = snapshot.responses['students/teachers/compare'].body.map(teacher => teacher.id);

beforeEach(() => engine.resetDemoData());

test('every captured GET response is reproduced exactly (body and status)', () => {
  const paths = Object.keys(snapshot.responses);
  assert.ok(paths.length > 70);
  for (const path of paths) {
    assert.deepEqual(call(path), snapshot.responses[path], path);
  }
});

test('derived views match the live API formulas exactly', () => {
  const performances = new Map(studentIds.map(id => [id, snapshot.responses[`students/students/${id}/performance`].body]));
  assert.deepEqual(JSON.parse(JSON.stringify(logic.compareStudents(studentIds, performances))), snapshot.responses['students/students/compare/'].body);
  for (const id of teacherIds) {
    const detail = snapshot.responses[`students/teachers/${id}`].body;
    const meta = logic.teacherMetaFrom(detail);
    assert.deepEqual(JSON.parse(JSON.stringify(logic.teacherDetail(meta, performances))), detail, `teacher ${id}`);
    const compare = snapshot.responses['students/teachers/compare'].body.find(teacher => teacher.id === id);
    assert.deepEqual(JSON.parse(JSON.stringify(logic.compareTeacher(meta, performances))), compare, `teacher compare ${id}`);
  }
});

test('local prediction algorithm reproduces every captured prediction', () => {
  for (const [path, result] of Object.entries(snapshot.responses)) {
    const match = path.match(/^students\/students\/(\d+)\/predict\/(\d+)$/);
    if (!match) continue;
    const performance = snapshot.responses[`students/students/${match[1]}/performance`].body;
    const order = Object.entries(snapshot.responses).find(([p, r]) => p.startsWith(`students/students/${match[1]}/predict/`) && r.status === 200)[1].body.predictions.map(p => p.subject_id);
    assert.deepEqual(JSON.parse(JSON.stringify(logic.predict(performance, Number(match[2]), order))), result, path);
  }
});

test('responses pass the app schemas', () => {
  assert.ok(studentSchemas.studentComparisonSchema.safeParse(call('students/students/compare/').body).success);
  assert.ok(studentSchemas.subjectOptionsSchema.safeParse(call('students/subjects').body).success);
  assert.ok(teacherSchemas.teacherComparisonSchema.safeParse(call('students/teachers/compare').body).success);
  assert.ok(examSchemas.upstreamEssayQuestionsSchema.safeParse(call('students/grade-answer/').body).success);
  for (const id of studentIds) {
    assert.ok(studentSchemas.studentPerformanceResponseSchema.safeParse(call(`students/students/${id}/performance`).body).success);
    assert.ok(studentSchemas.studentReportSchema.safeParse(call(`students/reports/students/${id}`).body).success);
    assert.ok(studentSchemas.predictionResponseSchema.safeParse(call(`students/students/${id}/predict/2050`).body).success);
  }
  for (const id of teacherIds) assert.ok(teacherSchemas.teacherDetailSchema.safeParse(call(`students/teachers/${id}`).body).success);
});

test('errors mirror the live API', () => {
  assert.deepEqual(call('students/students/42/performance'), { status: 404, body: { detail: 'No Student matches the given query.' } });
  assert.deepEqual(call('students/teachers/42'), { status: 404, body: { detail: 'No Teacher matches the given query.' } });
  assert.deepEqual(call('students/students/42/predict/2030'), { status: 404, body: { detail: 'No Student matches the given query.' } });
  assert.equal(call('students/students/1/predict/2000').status, 400);
  assert.equal(call('students/reports/students/42').status, 200, 'live API returns a report for any id');
  assert.equal(call('students/unknown').status, 404);
});

test('adding a year updates the student, comparisons and teachers, and persists', () => {
  const before = call('students/students/2/performance').body;
  const latest = Math.max(...before.history.map(year => Number(year.year_label.slice(0, 4))));
  const grades = [{ subject_id: 1, score: 90 }, { subject_id: 2, score: 80 }, { subject_id: 3, score: 70 }, { subject_id: 4, score: 60 }, { subject_id: 5, score: 100 }];
  const saved = call('students/grades/manage', 'POST', { student_id: 2, grades });
  assert.equal(saved.status, 200);
  assert.ok(studentSchemas.manageGradesResponseSchema.safeParse(saved.body).success);
  const year = saved.body.data.history.at(-1);
  assert.equal(year.year_label, `${latest + 1}-${latest + 2}`);
  assert.equal(year.gpa, 80);
  assert.equal(year.subjects[0].rating, 'Excellent');

  const performance = call('students/students/2/performance').body;
  assert.equal(performance.history.length, before.history.length + 1);
  const comparison = call('students/students/compare/').body.find(student => student.student_id === 2);
  assert.equal(comparison.yearly_performance.at(-1).gpa, 80);
  const math = call('students/teachers/1').body.students.find(student => student.student_id === 2);
  assert.equal(math.chart_data.at(-1).gpa, 70);
  const general = call('students/teachers/compare').body.find(teacher => teacher.is_general);
  assert.equal(general.yearly_performance.at(-1).year_label, year.year_label);
  assert.equal(general.yearly_performance.at(-1).students_count, 1);

  // New latest year → predictions for that year are now rejected and later ones recalculated.
  assert.equal(call(`students/students/2/predict/${latest + 1}`).status, 400);
  assert.equal(call(`students/students/2/predict/${latest + 2}`).body.latest_recorded_year, latest + 1);

  // Persisted across reloads, removed by reset.
  assert.ok(storage.get('big-demo-state-v1'));
  engine.resetDemoData();
  assert.deepEqual(call('students/students/2/performance').body, before);
});

test('editing a year replaces its scores and recalculates GPA', () => {
  const before = call('students/students/3/performance').body;
  const target = before.history[0];
  const saved = call('students/grades/manage', 'POST', JSON.stringify({ student_id: 3, academic_year_id: target.year_id, grades: target.subjects.map(subject => ({ subject_id: subject.subject_id, score: 100 })) }));
  assert.equal(saved.status, 200);
  const year = call('students/students/3/performance').body.history[0];
  assert.equal(year.year_label, target.year_label);
  assert.equal(year.gpa, 100);
  assert.equal(call('students/students/3/performance').body.history.length, before.history.length);
  assert.equal(call('students/students/compare/').body.find(student => student.student_id === 3).yearly_performance[0].rating, 'Excellent');
});

test('invalid grade requests are rejected', () => {
  assert.equal(call('students/grades/manage', 'POST', { student_id: 1, grades: [] }).status, 400);
  assert.equal(call('students/grades/manage', 'POST', { student_id: 1, grades: [{ subject_id: 1, score: 101 }] }).status, 400);
  assert.equal(call('students/grades/manage', 'POST', { student_id: 1, grades: [{ subject_id: 99, score: 50 }] }).status, 400);
  assert.equal(call('students/grades/manage', 'POST', { student_id: 77, grades: [{ subject_id: 1, score: 50 }] }).status, 404);
  assert.equal(call('students/grades/manage', 'POST', { student_id: 1, academic_year_id: 999, grades: [{ subject_id: 1, score: 50 }] }).status, 404);
});

test('essay grading is deterministic, bounded and rewards correct content', () => {
  const question = call('students/grade-answer/').body[0];
  const grade = answer => call('students/grade-answer/', 'POST', { question_id: question.id, student_answer: answer }).body;
  const full = grade(question.answer);
  assert.deepEqual(full, { question_id: question.id, score: 20, full_mark: 20 });
  assert.ok(examSchemas.upstreamEssayGradeSchema.safeParse(full).success);
  const partial = grade('انتصار مصر في حرب أكتوبر أعاد الثقة والكرامة للشعب المصري').score;
  assert.ok(partial > 0 && partial < 20, `partial ${partial}`);
  assert.equal(grade('كلام لا علاقة له بالسؤال إطلاقا').score, 0);
  assert.equal(grade(question.answer).score, full.score);
  assert.equal(call('students/grade-answer/', 'POST', { question_id: 999, student_answer: 'x' }).status, 404);
});

test('offline essay grading repeats the real AI score learned while online', () => {
  const question = call('students/grade-answer/').body[0];
  const answer = 'إجابة تدريبية تمت تجربتها أونلاين';
  const offline = () => call('students/grade-answer/', 'POST', { question_id: question.id, student_answer: answer }).body.score;
  assert.equal(offline(), 0);
  learned.rememberEssayGrade(question.id, '  إجابة تدريبية   تمت تجربتها أونلاين ', 13.5);
  assert.equal(offline(), 13.5);
  engine.resetDemoData();
  assert.equal(offline(), 13.5, 'real AI results survive a demo reset');
});

test('the demo reuses the real save message wording learned while online', () => {
  const grades = [{ subject_id: 1, score: 70 }];
  assert.ok(call('students/grades/manage', 'POST', { student_id: 4, grades }).body.message.includes('2024-2025'));
  engine.resetDemoData();
  learned.rememberSaveMessage('add', 'Grades saved for 2030-2031.', '2030-2031');
  assert.equal(call('students/grades/manage', 'POST', { student_id: 4, grades }).body.message, 'Grades saved for 2024-2025.');
  const yearId = call('students/students/4/performance').body.history[0].year_id;
  learned.rememberSaveMessage('edit', 'Updated successfully');
  learned.rememberSaveMessage('add', 'Year 2031/2032 added');
  assert.equal(call('students/grades/manage', 'POST', { student_id: 5, grades }).body.message, 'Year 2024-2025 added');
  learned.rememberEssayGrade(1, 'نَصٌّ', 7);
  assert.equal(learned.learnedEssayGrade(1, 'نص'), 7, 'diacritics ignored');
  assert.equal(call('students/grades/manage', 'POST', { student_id: 4, academic_year_id: yearId, grades }).body.message, 'Updated successfully');
});
