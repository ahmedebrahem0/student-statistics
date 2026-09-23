export const ratingFor = (score: number) => score >= 85 ? 'Excellent' : score >= 75 ? 'Very Good' : score >= 65 ? 'Good' : score >= 50 ? 'Pass' : 'Fail';
export const ratingLabel = (rating: string) => ({ Excellent: 'ممتاز', 'Very Good': 'جيد جدًا', Good: 'جيد', Pass: 'مقبول', Fail: 'غير مجتاز' }[rating] || rating);
export const numberLabel = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
export const ratingClass = (rating: string) => ({ Excellent: 'rating-excellent', 'Very Good': 'rating-very-good', Good: 'rating-good', Pass: 'rating-pass', Fail: 'rating-fail' }[rating] || '');

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function replaceNameInText(text: string, oldName: string, newName: string) {
  if (!oldName || oldName === newName) return text;
  let result = text.replace(new RegExp(escapeRegex(oldName), 'g'), newName);
  const oldFirst = oldName.split(/\s+/)[0];
  const newFirst = newName.split(/\s+/)[0];
  if (oldFirst && oldFirst !== oldName && oldFirst !== newFirst) {
    result = result.replace(new RegExp(`(^|\\s)${escapeRegex(oldFirst)}(?=\\s|$)`, 'g'), `$1${newFirst}`);
  }
  return result;
}

export function replaceStudentNameInReport<T>(report: T, oldName: string, newName: string): T {
  if (!oldName || oldName === newName) return report;
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return replaceNameInText(value, oldName, newName);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, walk(val)]));
    return value;
  };
  return walk(report) as T;
}
