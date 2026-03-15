import { useMemo } from 'react';
import { subjects } from '../data/questions';

const CONFETTI_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

function ConfettiPiece({ style }) {
  return <div className="confetti-piece" style={style} />;
}

export default function Results({ profile, subject, result, onPlayAgain, onChooseSubject }) {
  const { score, totalQuestions, earned, newBalance, todayEarned, dailyMax, cappedOut } = result;
  const subjectInfo = subjects.find(s => s.id === subject);
  const percent = Math.round((score / totalQuestions) * 100);

  const showConfetti = score >= 6;

  // Generate stable confetti pieces
  const confettiPieces = useMemo(() => {
    if (!showConfetti) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: `${2 + Math.random() * 3}s`,
      delay: `${Math.random() * 2}s`,
      size: `${8 + Math.random() * 8}px`,
      shape: Math.random() > 0.5 ? '50%' : '2px'
    }));
  }, [showConfetti]);

  // Score ring color
  const ringColor = score >= 8
    ? 'linear-gradient(135deg, #10b981, #059669)'
    : score >= 6
    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
    : 'linear-gradient(135deg, #6366f1, #4f46e5)';

  function getEmoji() {
    if (score === 10) return '🏆';
    if (score >= 8) return '🎉';
    if (score >= 6) return '😊';
    if (score >= 4) return '📚';
    return '💪';
  }

  function getMessage() {
    if (score === 10) return 'Perfect score! Amazing!';
    if (score >= 8) return 'Excellent work!';
    if (score >= 6) return 'Great job!';
    if (score >= 4) return 'Good effort!';
    return 'Keep practicing!';
  }

  function getLetterGrade(pct) {
    if (pct >= 97) return { letter: 'A+', color: '#059669' };
    if (pct >= 93) return { letter: 'A',  color: '#059669' };
    if (pct >= 90) return { letter: 'A−', color: '#10b981' };
    if (pct >= 87) return { letter: 'B+', color: '#2563eb' };
    if (pct >= 83) return { letter: 'B',  color: '#2563eb' };
    if (pct >= 80) return { letter: 'B−', color: '#3b82f6' };
    if (pct >= 77) return { letter: 'C+', color: '#d97706' };
    if (pct >= 73) return { letter: 'C',  color: '#d97706' };
    if (pct >= 70) return { letter: 'C−', color: '#f59e0b' };
    if (pct >= 67) return { letter: 'D+', color: '#dc2626' };
    if (pct >= 63) return { letter: 'D',  color: '#dc2626' };
    if (pct >= 60) return { letter: 'D−', color: '#ef4444' };
    return { letter: 'F', color: '#6b7280' };
  }

  const letterGrade = getLetterGrade(percent);

  return (
    <div className="results">
      <div className="results__card">
        {/* Confetti */}
        {showConfetti && (
          <div className="confetti-container">
            {confettiPieces.map(p => (
              <ConfettiPiece
                key={p.id}
                style={{
                  left: p.left,
                  backgroundColor: p.color,
                  width: p.size,
                  height: p.size,
                  borderRadius: p.shape,
                  animationDuration: p.duration,
                  animationDelay: p.delay
                }}
              />
            ))}
          </div>
        )}

        <div className="results__title">
          {getEmoji()} {getMessage()}
        </div>
        <div className="results__subtitle">
          {profile.emoji} {profile.name} — {subjectInfo?.emoji} {subjectInfo?.label}
        </div>

        {/* Score Ring */}
        <div className="results__score-ring" style={{ background: ringColor }}>
          <div className="results__score-number">{score}</div>
          <div className="results__score-label">out of {totalQuestions}</div>
        </div>

        {/* Letter Grade */}
        <div className="results__grade" style={{ color: letterGrade.color, borderColor: letterGrade.color }}>
          <span className="results__grade-letter">{letterGrade.letter}</span>
          <span className="results__grade-label">Grade</span>
        </div>

        {/* Stats */}
        <div className="results__stats">
          <div className="results__stat">
            <div className="results__stat-value">{percent}%</div>
            <div className="results__stat-label">Score</div>
          </div>
          <div className="results__stat">
            <div className="results__stat-value">{score}</div>
            <div className="results__stat-label">Correct</div>
          </div>
          <div className="results__stat">
            <div className="results__stat-value">{totalQuestions - score}</div>
            <div className="results__stat-label">Missed</div>
          </div>
        </div>

        {/* Earned */}
        {cappedOut ? (
          <div className="results__earned results__earned--capped">
            🏁 Daily max reached — great work today!
          </div>
        ) : (
          <div className="results__earned">+{earned} minutes earned ⏱</div>
        )}

        {/* Daily progress bar */}
        <div className="results__daily">
          <div className="results__daily-label">
            Today: <strong>{todayEarned}</strong> / {dailyMax} min
          </div>
          <div className="results__daily-bar">
            <div
              className="results__daily-fill"
              style={{ width: `${Math.min(100, (todayEarned / dailyMax) * 100)}%` }}
            />
          </div>
        </div>

        <div className="results__total">
          Total balance: <strong>{newBalance} minutes</strong>
        </div>

        {/* Actions */}
        <div className="results__actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            🔄 Play Again
          </button>
          <button className="btn btn-ghost" onClick={onChooseSubject}
            style={{ color: '#1e1b4b', border: '2px solid #e5e7eb', background: '#f3f4f6' }}>
            📚 Choose Subject
          </button>
        </div>
      </div>
    </div>
  );
}
