// Captures a full read-only snapshot of the live API for the offline demo mode.
// Usage: node scripts/capture-demo-data.mjs   (needs internet; never sends POST requests)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const API_BASE = 'https://api.big-education-egypt.com/api';
const OUT = fileURLToPath(new URL('../src/demo/snapshot.json', import.meta.url));
const PREDICT_YEARS_AHEAD = 10;

const responses = {};

async function get(path, { timeout = 30_000, retries = 3 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}/${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(timeout) });
      const text = await response.text();
      const body = text ? JSON.parse(text) : null;
      responses[path] = { status: response.status, body };
      console.log(`${response.status}  ${path}`);
      return { status: response.status, body };
    } catch (error) {
      lastError = error;
      console.warn(`retry ${attempt}/${retries}  ${path}: ${error.message}`);
    }
  }
  throw new Error(`Failed to fetch ${path}: ${lastError?.message}`);
}

function expectOk(result, path) {
  if (result.status !== 200) throw new Error(`Expected 200 for ${path}, got ${result.status}`);
  return result.body;
}

const students = expectOk(await get('students/students/compare/'), 'students compare');
const teachers = expectOk(await get('students/teachers/compare'), 'teachers compare');
expectOk(await get('students/subjects'), 'subjects');
expectOk(await get('students/grade-answer/'), 'grade-answer');

for (const { id } of teachers) expectOk(await get(`students/teachers/${id}`), `teacher ${id}`);

for (const { student_id: id } of students) {
  const performance = expectOk(await get(`students/students/${id}/performance`), `student ${id}`);
  // The API's "latest_recorded_year" is the START year of the last label ("2023-2024" → 2023).
  const years = performance.history.map(year => Number(year.year_label.slice(0, 4)));
  const latest = Math.max(...years);
  for (let year = latest + 1; year <= latest + PREDICT_YEARS_AHEAD; year++) {
    expectOk(await get(`students/students/${id}/predict/${year}`), `predict ${id}/${year}`);
  }
  await get(`students/students/${id}/predict/${latest}`); // 400 sample
}

for (const { student_id: id } of students) {
  const report = expectOk(await get(`students/reports/students/${id}`, { timeout: 120_000 }), `report ${id}`);
  if (!report?.analytics_data || !report?.comprehensive_ai_report) throw new Error(`Incomplete report for student ${id}`);
}

// Error samples, so offline errors match the live API exactly.
await get('students/students/999999/performance');
await get('students/teachers/999999');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({ capturedAt: new Date().toISOString(), apiBase: API_BASE, responses }, null, 2) + '\n');
console.log(`\nSaved ${Object.keys(responses).length} responses to ${OUT}`);
