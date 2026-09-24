"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpenCheck, Check, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, ClipboardList, Eye, RotateCcw, X } from "lucide-react";
import { QUESTION_SCORE, SOCIAL_STUDIES_EXAM_VERSION, TOTAL_SCORE, getScoreMessage, socialStudiesQuestions } from "./exam.data";

type Stage = "exam" | "result" | "review";
type Answers = Record<number, number>;

export default function StudentExam({ studentId, studentName }: { studentId: number; studentName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stage, setStage] = useState<Stage>("exam");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [score, setScore] = useState<number | null>(null);
  const [guidance, setGuidance] = useState(false);
  const [launcherExpanded, setLauncherExpanded] = useState(false);
  const storageKey = `big-education:exam:${SOCIAL_STUDIES_EXAM_VERSION}:completed:${studentId}`;

  useEffect(() => {
    const readStatus = window.setTimeout(() => {
      try { setCompleted(sessionStorage.getItem(storageKey) === "true"); } catch { setCompleted(false); }
      setChecked(true);
    }, 0);
    return () => window.clearTimeout(readStatus);
  }, [storageKey]);

  const answeredCount = Object.keys(answers).length;
  const result = useMemo(() => socialStudiesQuestions.reduce((total, question) => total + (answers[question.id] === question.correctAnswer ? QUESTION_SCORE : 0), 0), [answers]);

  const open = () => {
    setStage("exam"); setCurrent(0); setAnswers({}); setScore(null); setGuidance(false);
    dialogRef.current?.showModal();
  };
  const close = () => {
    dialogRef.current?.close();
    setAnswers({}); setScore(null); setCurrent(0); setStage("exam"); setGuidance(false);
  };
  const submit = () => {
    if (answeredCount !== socialStudiesQuestions.length) { setGuidance(true); return; }
    if (!window.confirm("هل أنت متأكد من تسليم الامتحان؟ يمكنك مراجعة إجاباتك قبل التسليم.")) return;
    setScore(result); setStage("result");
    try { sessionStorage.setItem(storageKey, "true"); } catch { /* The result still works when storage is unavailable. */ }
    setCompleted(true);
  };

  if (!checked || (completed && score === null)) return null;
  const question = socialStudiesQuestions[current];

  return <>
    <button
      className={`exam-launcher ${launcherExpanded ? "is-expanded" : ""}`}
      onClick={(event) => {
        const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
        if (isCoarsePointer && !launcherExpanded) { event.preventDefault(); setLauncherExpanded(true); return; }
        open();
      }}
      onBlur={() => setLauncherExpanded(false)}
      aria-label={`امتحان متاح: الدراسات الاجتماعية للطالب ${studentName}`}
    >
      <span className="exam-launcher-icon" aria-hidden="true"><ClipboardList size={19} /><i /></span>
      <span className="exam-launcher-details" aria-hidden="true"><span><strong>امتحان متاح</strong><small>الدراسات الاجتماعية</small></span></span>
      <ChevronDown size={13} className="exam-launcher-arrow" aria-hidden="true" />
    </button>

    <dialog ref={dialogRef} className="exam-dialog" aria-labelledby="exam-title" onCancel={(event) => { event.preventDefault(); close(); }}>
      <div className="exam-shell">
        <header className="exam-header">
          <span className="exam-header-mark"><BookOpenCheck size={24} /></span>
          <div><span>اختبار قصير • ٨ أسئلة</span><h2 id="exam-title">الدراسات الاجتماعية</h2><p>{studentName}</p></div>
          <button className="exam-close" onClick={close} aria-label="إغلاق الامتحان"><X size={21} /></button>
        </header>

        {stage === "exam" ? <div className="exam-workspace">
          <nav className="exam-question-rail" aria-label="التنقل بين أسئلة الامتحان">
            {socialStudiesQuestions.map((item, index) => <button key={item.id} className={`${index === current ? "is-current" : ""} ${answers[item.id] !== undefined ? "is-answered" : ""}`} onClick={() => setCurrent(index)} aria-label={`السؤال ${index + 1}${answers[item.id] !== undefined ? "، تمت الإجابة" : ""}`} aria-current={index === current ? "step" : undefined}>{answers[item.id] !== undefined ? <Check size={14} /> : index + 1}</button>)}
          </nav>
          <main className="exam-question-card">
            <div className="exam-progress-line"><span>السؤال {current + 1} من {socialStudiesQuestions.length}</span><span>{answeredCount} / {socialStudiesQuestions.length} تمت الإجابة</span></div>
            <div className="exam-progress"><i style={{ width: `${(answeredCount / socialStudiesQuestions.length) * 100}%` }} /></div>
            <fieldset>
              <legend><span>{String(current + 1).padStart(2, "0")}</span>{question.question}</legend>
              <div className="exam-options">{question.choices.map((choice, index) => <label key={choice} className={answers[question.id] === index ? "is-selected" : ""}><input type="radio" name={`question-${question.id}`} value={index} checked={answers[question.id] === index} onChange={() => { setAnswers(previous => ({ ...previous, [question.id]: index })); setGuidance(false); }} /><span className="exam-radio" /><span>{choice}</span></label>)}</div>
            </fieldset>
            {guidance && <p className="exam-guidance" role="alert">أجب عن كل الأسئلة قبل التسليم. بقي {socialStudiesQuestions.length - answeredCount}.</p>}
            <footer className="exam-actions">
              <button className="secondary-button" disabled={current === 0} onClick={() => setCurrent(value => value - 1)}><ChevronRight size={17} />السابق</button>
              {current < socialStudiesQuestions.length - 1 ? <button className="primary-button" onClick={() => setCurrent(value => value + 1)}>التالي<ChevronLeft size={17} /></button> : <button className="exam-submit" onClick={submit} aria-disabled={answeredCount !== socialStudiesQuestions.length}><CircleCheck size={18} />تسليم الامتحان</button>}
            </footer>
          </main>
        </div> : <ResultView stage={stage} score={score ?? result} studentName={studentName} answers={answers} onReview={() => setStage("review")} onResult={() => setStage("result")} onClose={close} />}
      </div>
    </dialog>
  </>;
}

function ResultView({ stage, score, studentName, answers, onReview, onResult, onClose }: { stage: Stage; score: number; studentName: string; answers: Answers; onReview: () => void; onResult: () => void; onClose: () => void }) {
  const gaugeDegrees = (score / TOTAL_SCORE) * 180;
  return <div className={`exam-result-layout ${stage === "review" ? "is-review" : ""}`}>
    <aside className="exam-score-card">
      <span className="exam-complete"><CircleCheck size={16} />تم تسليم الامتحان</span>
      <h3>أحسنت يا {studentName}</h3>
      <p>هذه نتيجتك في الدراسات الاجتماعية</p>
      <div className="exam-gauge" style={{ "--score-angle": `${gaugeDegrees}deg` } as React.CSSProperties} aria-label={`النتيجة ${score} من ${TOTAL_SCORE}`}><div><strong>{score}<small> / {TOTAL_SCORE}</small></strong><span>درجتك</span></div></div>
      <div className="exam-message">{getScoreMessage(score)}</div>
      <div className="exam-result-actions">{stage === "review" ? <button className="secondary-button" onClick={onResult}><RotateCcw size={17} />العودة للنتيجة</button> : <button className="primary-button" onClick={onReview}><Eye size={17} />إظهار الإجابات</button>}<button className="text-button" onClick={onClose}>إغلاق</button></div>
    </aside>
    {stage === "review" && <main className="exam-review">
      <div className="exam-review-heading"><div><span>مراجعة الإجابات</span><h3>تعلّم من كل اختيار</h3></div><div className="exam-review-key"><span><i className="correct" />الإجابة الصحيحة</span><span><i className="wrong" />اختيارك غير الصحيح</span></div></div>
      {socialStudiesQuestions.map((question, questionIndex) => <section key={question.id} className="exam-review-question"><h4><span>{questionIndex + 1}</span>{question.question}</h4><div>{question.choices.map((choice, choiceIndex) => { const correct = choiceIndex === question.correctAnswer; const selectedWrong = answers[question.id] === choiceIndex && !correct; return <p key={choice} className={correct ? "is-correct" : selectedWrong ? "is-wrong" : ""}>{correct ? <Check size={15} /> : <span />}{choice}{selectedWrong && <small>اختيارك</small>}</p>; })}</div></section>)}
    </main>}
  </div>;
}
