export type ExamQuestion = {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: number;
};

export const SOCIAL_STUDIES_EXAM_VERSION = "social-studies-v1";
export const QUESTION_SCORE = 10;
export const MCQ_TOTAL_SCORE = 80;
export const ESSAY_SCORE = 20;
export const TOTAL_SCORE = 100;

export const socialStudiesQuestions: ExamQuestion[] = [
  { id: 1, question: "ما عاصمة جمهورية مصر العربية؟", choices: ["القاهرة", "الإسكندرية", "الأقصر", "أسوان"], correctAnswer: 0 },
  { id: 2, question: "أي نهر يمر عبر مصر؟", choices: ["نهر الأمازون", "نهر النيل", "نهر دجلة", "نهر السين"], correctAnswer: 1 },
  { id: 3, question: "في أي مدينة توجد أهرامات الجيزة؟", choices: ["السويس", "المنصورة", "الجيزة", "الغردقة"], correctAnswer: 2 },
  { id: 4, question: "ما البحر الذي يحد مصر من الشمال؟", choices: ["البحر الأحمر", "البحر المتوسط", "بحر العرب", "البحر الميت"], correctAnswer: 1 },
  { id: 5, question: "تقع شبه جزيرة سيناء شرق مصر.", choices: ["صح", "خطأ"], correctAnswer: 0 },
  { id: 6, question: "الريال هو العملة الرسمية في مصر.", choices: ["صح", "خطأ"], correctAnswer: 1 },
  { id: 7, question: "تُعرف الإسكندرية بعروس البحر المتوسط.", choices: ["صح", "خطأ"], correctAnswer: 0 },
  { id: 8, question: "بنت الحضارة الرومانية أهرامات الجيزة.", choices: ["صح", "خطأ"], correctAnswer: 1 },
];

export function getScoreMessage(score: number) {
  if (score === 100) return "إجابة رائعة يا بطل! أتقنت كل الأسئلة، واصل هذا التفوق.";
  if (score >= 85) return "ممتاز جدًا! خطوة صغيرة تفصلك عن الدرجة الكاملة.";
  if (score >= 70) return "أداء قوي ومبشّر. راجع إجاباتك لتصل إلى القمة.";
  if (score >= 60) return "نتيجة جيدة، ومع مراجعة بسيطة ستتقدم أكثر.";
  if (score >= 50) return "بداية طيبة. راجع المعلومات التي فاتتك ثم جرّب أسئلة جديدة.";
  return "لا بأس، كل محاولة فرصة للتعلم. راجع الأساسيات وسترى فرقًا كبيرًا.";
}

export function calculateMcqScore(answers: Record<number, number>) {
  return socialStudiesQuestions.reduce((total, question) => total + (answers[question.id] === question.correctAnswer ? QUESTION_SCORE : 0), 0);
}

export function getMissingQuestionNumbers(answers: Record<number, number>, essayAnswer: string) {
  const missing = socialStudiesQuestions.flatMap((question, index) => answers[question.id] === undefined ? [index + 1] : []);
  if (!essayAnswer.trim()) missing.push(9);
  return missing;
}
