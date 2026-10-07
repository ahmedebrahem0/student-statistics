import assert from "node:assert/strict";
import test from "node:test";
import { calculateMcqScore, getMissingQuestionNumbers, socialStudiesQuestions } from "./exam.data.ts";

test("calculateMcqScore awards ten marks for every correct MCQ", () => {
  const correctAnswers = Object.fromEntries(socialStudiesQuestions.map(question => [question.id, question.correctAnswer]));
  assert.equal(calculateMcqScore(correctAnswers), 80);
  assert.equal(calculateMcqScore({ ...correctAnswers, [socialStudiesQuestions[0].id]: 99 }), 70);
});

test("getMissingQuestionNumbers lists unanswered MCQs and the blank essay", () => {
  assert.deepEqual(getMissingQuestionNumbers({}, "   "), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const answers = Object.fromEntries(socialStudiesQuestions.map(question => [question.id, 0]));
  assert.deepEqual(getMissingQuestionNumbers(answers, "إجابة"), []);
});
