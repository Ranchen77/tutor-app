import { useEffect, useState } from 'react';

const BURST_COLORS = ['#f59e0b','#10b981','#7c3aed','#ef4444','#3b82f6','#ec4899','#f97316','#06b6d4','#84cc16'];

function Star({ style }) {
  return <div className="daily-star" style={style} />;
}

export default function DailyCompleteOverlay({ profile, bonusMinutes, bonusMoney, onCollect }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay so it appears after the results card settles
    const t = setTimeout(() => setShow(true), 400);
    return () => clearTimeout(t);
  }, []);

  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: BURST_COLORS[i % BURST_COLORS.length],
    size: `${6 + Math.random() * 10}px`,
    duration: `${1.5 + Math.random() * 2.5}s`,
    delay: `${Math.random() * 1.2}s`,
    shape: Math.random() > 0.4 ? '50%' : '2px',
    drift: `${(Math.random() - 0.5) * 120}px`,
  }));

  return (
    <div className={`daily-overlay ${show ? 'daily-overlay--visible' : ''}`}>
      {/* Confetti */}
      <div className="daily-confetti">
        {stars.map(s => (
          <Star key={s.id} style={{
            left: s.left,
            width: s.size, height: s.size,
            borderRadius: s.shape,
            backgroundColor: s.color,
            animationDuration: s.duration,
            animationDelay: s.delay,
            '--drift': s.drift,
          }} />
        ))}
      </div>

      {/* Card */}
      <div className="daily-card">
        <div className="daily-card__trophy">🏆</div>
        <h2 className="daily-card__title">All 9 Subjects Done!</h2>
        <p className="daily-card__sub">{profile.name}, you crushed it today! 🔥</p>

        <div className="daily-card__bonus">
          <div className="daily-card__bonus-item">
            <span className="daily-card__bonus-icon">⏱</span>
            <span className="daily-card__bonus-value">+{bonusMinutes} min</span>
            <span className="daily-card__bonus-label">bonus screen time</span>
          </div>
          <div className="daily-card__bonus-divider" />
          <div className="daily-card__bonus-item">
            <span className="daily-card__bonus-icon">💰</span>
            <span className="daily-card__bonus-value">+${bonusMoney.toFixed(2)}</span>
            <span className="daily-card__bonus-label">bonus money</span>
          </div>
        </div>

        <button className="daily-card__btn" onClick={onCollect}>
          Collect Reward 🎉
        </button>
      </div>
    </div>
  );
}
