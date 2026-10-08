import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const endpoint = 'https://api.big-education-egypt.com/api/students/grade-answer/';
const question = { id: 1, question: 'Essay question', full_mark: 20, answer: 'Model answer' };
function compile(file, dependencies, globals = {}) {
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: (name) => dependencies[name] ?? require(name), ...globals });
  return exports;
}
const apiConstants = compile('../../../../shared/constants/api-endpoints.ts', {});
const schemas = compile('../../../../features/student/schema/exam.schema.ts', {});
function loadRoute(responses) {
  const calls = [];
  const route = compile('./route.ts', {
    'next/server': { NextResponse: { json: (body, init) => Response.json(body, init) } },
    '@/features/student/schema/exam.schema': schemas,
    '@/shared/constants/api-endpoints': apiConstants,
  }, {
    AbortSignal,
    fetch: async (url, init) => {
      calls.push({ url, init });
      const response = responses.shift();
      assert.ok(response, 'Unexpected upstream request');
      return Response.json(response.body, { status: response.status ?? 200 });
    },
  });
  return { ...route, calls };
}

test('GET uses the production grading endpoint and hides the model answer', async () => {
  const route = loadRoute([{ body: [question] }]);
  const response = await route.GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: 1, question: question.question, fullMark: 20 });
  assert.equal(route.calls[0].url, endpoint);
  assert.equal(route.calls[0].init.cache, 'no-store');
});

test('POST maps request fields and returns the grade with the matching model answer', async () => {
  const route = loadRoute([{ body: { question_id: 1, score: 15, full_mark: 20 } }, { body: [question] }]);
  const response = await route.POST(new Request('http://localhost/api/student/exam', {
    method: 'POST', body: JSON.stringify({ questionId: 1, studentAnswer: ' Student answer ' }),
  }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { questionId: 1, score: 15, fullMark: 20, modelAnswer: question.answer });
  assert.equal(route.calls.length, 2);
  for (const call of route.calls) assert.equal(call.url, endpoint);
  assert.equal(route.calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(route.calls[0].init.body), { question_id: 1, student_answer: 'Student answer' });
});

test('POST rejects empty answers without calling the backend', async () => {
  const route = loadRoute([]);
  const response = await route.POST(new Request('http://localhost/api/student/exam', {
    method: 'POST', body: JSON.stringify({ questionId: 1, studentAnswer: ' ' }),
  }));
  assert.equal(response.status, 400);
  assert.equal(route.calls.length, 0);
});

test('GET reports upstream failures', async () => {
  const route = loadRoute([{ status: 503, body: {} }]);
  assert.equal((await route.GET()).status, 502);
});

test('POST rejects a grade for a different question', async () => {
  const route = loadRoute([{ body: { question_id: 2, score: 15, full_mark: 20 } }]);
  const response = await route.POST(new Request('http://localhost/api/student/exam', {
    method: 'POST', body: JSON.stringify({ questionId: 1, studentAnswer: 'Answer' }),
  }));
  assert.equal(response.status, 502);
  assert.equal(route.calls.length, 1);
});

