// Real server results seen while online, remembered on this device so the offline demo repeats them:
//  - AI essay grades: the same answer offline gets exactly the score the AI gave it.
//  - The wording of the "grades saved" message.
// Not cleared by "reset demo data": these are real results, not demo edits.
const KEY = 'big-demo-learned-essays-v1';
type Learned = Record<string, number>;

const keyFor = (questionId: number, answer: string) =>
  `${questionId}:${answer.replace(/[\u064B-\u0652\u0640]/g, '').replace(/\s+/g, ' ').trim()}`;

function read(): Learned {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Learned; } catch { return {}; }
}

export function rememberEssayGrade(questionId: number, answer: string, score: number) {
  try {
    const learned = read();
    learned[keyFor(questionId, answer)] = score;
    localStorage.setItem(KEY, JSON.stringify(learned));
  } catch { /* storage unavailable */ }
}

export function learnedEssayGrade(questionId: number, answer: string): number | undefined {
  return read()[keyFor(questionId, answer)];
}

const MESSAGE_KEY = 'big-demo-learned-save-message-v1';
const YEAR_LABEL = /\d{4}\s*[-/]\s*\d{4}/;
type SaveKind = 'add' | 'edit';

/** Stores the server's message as a template, with the year label replaced by a placeholder. */
export function rememberSaveMessage(kind: SaveKind, message: string, yearLabel?: string) {
  try {
    const template = yearLabel && message.includes(yearLabel) ? message.replace(yearLabel, '{year}') : message.replace(YEAR_LABEL, '{year}');
    const stored = JSON.parse(localStorage.getItem(MESSAGE_KEY) || '{}') as Partial<Record<SaveKind, string>>;
    stored[kind] = template;
    localStorage.setItem(MESSAGE_KEY, JSON.stringify(stored));
  } catch { /* storage unavailable */ }
}

export function learnedSaveMessage(kind: SaveKind, yearLabel: string): string | undefined {
  try {
    const template = (JSON.parse(localStorage.getItem(MESSAGE_KEY) || '{}') as Partial<Record<SaveKind, string>>)[kind];
    return template?.replace('{year}', yearLabel);
  } catch { return undefined; }
}
