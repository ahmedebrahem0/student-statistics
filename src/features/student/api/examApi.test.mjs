import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const { configureStore } = require('@reduxjs/toolkit');
function compile(file, dependencies = {}) {
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => dependencies[name] ?? require(name) });
  return exports;
}
const schemas = compile('../schema/exam.schema.ts');
const { examApi } = compile('./examApi.ts', { '../schema/exam.schema': schemas });
const endpoint = 'https://api.big-education-egypt.com/api/students/grade-answer/';
const question = { id: 1, question: 'Question', full_mark: 20, answer: 'Model answer' };

test('exam GET and POST use the full API domain and adapt backend fields', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async request => {
    calls.push({ url: request.url, method: request.method, body: request.method === 'POST' ? await request.json() : undefined });
    return Response.json(request.method === 'POST' ? { question_id: 1, score: 15, full_mark: 20 } : [question]);
  };
  const store = configureStore({ reducer: { [examApi.reducerPath]: examApi.reducer }, middleware: getDefault => getDefault().concat(examApi.middleware) });
  try {
    const result = await store.dispatch(examApi.endpoints.getEssayQuestion.initiate()).unwrap();
    assert.deepEqual(JSON.parse(JSON.stringify(result)), { id: 1, question: 'Question', fullMark: 20 });
    const grade = await store.dispatch(examApi.endpoints.gradeEssay.initiate({ questionId: 1, studentAnswer: ' Answer ' })).unwrap();
    assert.deepEqual(JSON.parse(JSON.stringify(grade)), { questionId: 1, score: 15, fullMark: 20, modelAnswer: 'Model answer' });
    assert.equal(calls.length, 3);
    for (const call of calls) assert.equal(call.url, endpoint);
    assert.deepEqual(calls[1].body, { question_id: 1, student_answer: 'Answer' });
    const count = calls.length;
    const invalid = await store.dispatch(examApi.endpoints.gradeEssay.initiate({ questionId: 1, studentAnswer: ' ' }));
    assert.equal(invalid.error.status, 'CUSTOM_ERROR');
    assert.equal(calls.length, count);
  } finally {
    store.dispatch(examApi.util.resetApiState());
    globalThis.fetch = originalFetch;
  }
});
