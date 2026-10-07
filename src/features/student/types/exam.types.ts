export type EssayQuestion = {
  id: number;
  question: string;
  fullMark: number;
};

export type GradeEssayRequest = {
  questionId: number;
  studentAnswer: string;
};

export type EssayGrade = {
  questionId: number;
  score: number;
  fullMark: number;
  modelAnswer: string;
};
