import { fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { STUDENT_API_BASE_URL } from '@/shared/constants/api-endpoints';
import { notifyConnectionLost, resolveDataMode } from '@/demo/mode';
import { rememberEssayGrade, rememberSaveMessage } from '@/demo/learned';

type Options = { path?: string; timeout: number };

/** Remembers the AI's real essay score so the offline demo can repeat it for the same answer. */
function learnFromLiveGrade(requestBody: unknown, data: unknown) {
  const request = requestBody as { question_id?: unknown; student_answer?: unknown } | undefined;
  const grade = data as { question_id?: unknown; score?: unknown } | undefined;
  if (typeof request?.student_answer === 'string' && typeof grade?.score === 'number' && grade.question_id === request.question_id) {
    rememberEssayGrade(Number(grade.question_id), request.student_answer, grade.score);
  }
}

/** Remembers the server's "saved" message wording for the offline demo. */
function learnFromLiveSave(requestBody: unknown, data: unknown) {
  const request = requestBody as { academic_year_id?: unknown } | undefined;
  const response = data as { message?: unknown; data?: { history?: { year_id?: unknown; year_label?: unknown }[] } } | undefined;
  if (typeof response?.message !== 'string') return;
  const editing = request?.academic_year_id !== undefined && request?.academic_year_id !== null;
  const history = response.data?.history ?? [];
  const year = editing ? history.find(item => item.year_id === request?.academic_year_id) : history.at(-1);
  rememberSaveMessage(editing ? 'edit' : 'add', response.message, typeof year?.year_label === 'string' ? year.year_label : undefined);
}

/**
 * Drop-in replacement for fetchBaseQuery. In live mode it calls the real API;
 * in demo mode it answers from the offline engine with the exact same response
 * shapes (including error shapes), so components behave identically.
 * `path` is the API path below STUDENT_API_BASE_URL that this API's urls are relative to.
 */
export function smartBaseQuery({ path = '', timeout }: Options): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const live = fetchBaseQuery({ baseUrl: `${STUDENT_API_BASE_URL}/${path}`, timeout });
  return async (args, api, extraOptions) => {
    const mode = await resolveDataMode();
    if (mode === 'live') {
      const result = await live(args, api, extraOptions);
      if (result.error && (result.error.status === 'FETCH_ERROR' || result.error.status === 'TIMEOUT_ERROR')) notifyConnectionLost();
      if (!result.error && typeof args !== 'string' && args.method === 'POST') {
        if (path === 'students/grade-answer/') learnFromLiveGrade(args.body, result.data);
        if (args.url === 'students/grades/manage') learnFromLiveSave(args.body, result.data);
      }
      return result;
    }
    const request = typeof args === 'string' ? { url: args } : args;
    const { handleDemoRequest } = await import('@/demo/engine');
    const result = await handleDemoRequest({ method: request.method, path: `${path}${request.url}`, body: request.body });
    return result.status >= 200 && result.status < 300
      ? { data: result.body }
      : { error: { status: result.status, data: result.body } };
  };
}
