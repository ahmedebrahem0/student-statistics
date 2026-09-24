export type ExamQuestion = {
  id: number;
  question: string;
  choices: string[];
  correctAnswer: number;
};

export const SOCIAL_STUDIES_EXAM_VERSION = "social-studies-v1";
export const QUESTION_SCORE = 10;
export const TOTAL_SCORE = 80;

export const socialStudiesQuestions: ExamQuestion[] = [
  { id: 1, question: "ما عاصمة جمهورية مصر العربية؟", choices: ["القاهرة", "الإسكندرية", "الأقصر", "أسوان"], correctAnswer: 0 },
  { id: 2, question: "أي نهر يمر عبر مصر؟", choices: ["نهر الأمازون", "نهر النيل", "نهر دجلة", "نهر السين"], correctAnswer: 1 },
  { id: 3, question: "في أي مدينة توجد أهرامات الجيزة؟", choices: ["السويس", "المنصورة", "الجيزة", "الغردقة"], correctAnswer: 2 },
  { id: 4, question: "ما البحر الذي يحد مصر من الشمال؟", choices: ["البحر الأحمر", "البحر المتوسط", "بحر العرب", "البحر الميت"], correctAnswer: 1 },
  { id: 5, question: "ما اسم شبه الجزيرة الواقعة شرق مصر؟", choices: ["سيناء", "العربية", "الأناضول", "البلقان"], correctAnswer: 0 },
  { id: 6, question: "ما العملة الرسمية في مصر؟", choices: ["الريال", "الدينار", "الجنيه المصري", "الدرهم"], correctAnswer: 2 },
  { id: 7, question: "أي مدينة مصرية تُعرف بعروس البحر المتوسط؟", choices: ["بورسعيد", "الإسكندرية", "دمياط", "الإسماعيلية"], correctAnswer: 1 },
  { id: 8, question: "أي حضارة بنت الأهرامات؟", choices: ["الحضارة المصرية القديمة", "الحضارة الرومانية", "الحضارة الفارسية", "الحضارة اليونانية"], correctAnswer: 0 },
];

export function getScoreMessage(score: number) {
  if (score === 80) return "إجابة رائعة يا بطل! أتقنت كل الأسئلة، واصل هذا التفوق.";
  if (score >= 70) return "ممتاز جدًا! خطوة صغيرة تفصلك عن الدرجة الكاملة.";
  if (score >= 60) return "أداء قوي ومبشّر. راجع إجاباتك لتصل إلى القمة.";
  if (score >= 50) return "نتيجة جيدة، ومع مراجعة بسيطة ستتقدم أكثر.";
  if (score >= 40) return "بداية طيبة. راجع المعلومات التي فاتتك ثم جرّب أسئلة جديدة.";
  return "لا بأس، كل محاولة فرصة للتعلم. راجع الأساسيات وسترى فرقًا كبيرًا.";
}
