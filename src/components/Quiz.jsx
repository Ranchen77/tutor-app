import { useState, useEffect, useRef } from 'react';
import { getQuestions, subjects } from '../data/questions';
import { ArrowLeft } from './Icons';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function Quiz({ profile, subject, onFinish, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);  // index of chosen option
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  // Ref tracks running score to avoid stale closure when finishing quiz
  const scoreRef = useRef(0);

  // Load questions once on mount / when subject changes (Play Again)
  useEffect(() => {
    const qs = getQuestions(profile.grade, subject);
    setQuestions(qs);
    setCurrentIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setSelected(null);
    setAnswered(false);
  }, [profile.grade, subject]);

  if (questions.length === 0) {
    return (
      <div className="quiz">
        <div className="quiz__header">
          <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
          <span className="quiz__title">Loading…</span>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const subjectInfo = subjects.find(s => s.id === subject);
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;

  function handleSelect(optionIndex) {
    if (answered) return;
    const correct = optionIndex === q.correctIndex;
    setSelected(optionIndex);
    setAnswered(true);
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      onFinish(scoreRef.current, questions.length);
      return;
    }
    setCurrentIndex(prev => prev + 1);
    setSelected(null);
    setAnswered(false);
  }

  function getOptionClass(idx) {
    if (!answered) return '';
    if (idx === q.correctIndex) return 'correct';
    if (idx === selected && idx !== q.correctIndex) return 'wrong';
    return '';
  }

  return (
    <div className="quiz">
      {/* Header */}
      <div className="quiz__header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /> Back</button>
        <span className="quiz__title">
          {profile.emoji} {profile.name} — {subjectInfo?.emoji} {subjectInfo?.label}
        </span>
        <span className="quiz__score-badge">✓ {score} correct</span>
      </div>

      {/* Progress */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="quiz__counter">
        Question {currentIndex + 1} of {questions.length}
      </div>

      {/* Question Card */}
      <div className="quiz__card">
        <div className="quiz__question">{q.question}</div>

        <div className="options-grid">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              className={`option-btn ${getOptionClass(idx)}`}
              onClick={() => handleSelect(idx)}
              disabled={answered}
            >
              <span className="option-letter">{LETTERS[idx]}</span>
              {opt}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {answered && (
          <div className={`quiz__feedback ${selected === q.correctIndex ? 'correct-fb' : 'wrong-fb'}`}>
            <strong>
              {selected === q.correctIndex
                ? '✅ Correct! Well done!'
                : `❌ Not quite — the correct answer was "${q.options[q.correctIndex]}"`}
            </strong>
            <span className="quiz__feedback-explanation">{q.explanation}</span>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button className="quiz__next" onClick={handleNext}>
            {isLastQuestion ? 'See Results 🎉' : 'Next →'}
          </button>
        )}
      </div>
    </div>
  );
}
