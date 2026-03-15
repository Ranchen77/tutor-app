import { AVATARS } from './Avatars';
import { subjects } from '../data/questions';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ProfileStats({ profile, onBack }) {
  const AvatarComponent = AVATARS[profile.avatarIndex ?? 0];

  // ── Compute all-time stats from history ──────
  const quizEntries = profile.history.filter(h => h.subject && !h.type);

  const allTimeMinutes = profile.history
    .filter(h => !h.type && h.earned > 0)
    .reduce((sum, h) => sum + h.earned, 0);

  const allTimeMoney = profile.history
    .filter(h => h.moneyEarned > 0)
    .reduce((sum, h) => sum + h.moneyEarned, 0);

  const totalSessions = quizEntries.length;
  const perfectScores = quizEntries.filter(h => h.score === h.total).length;
  const rewardedSessions = quizEntries.filter(h => h.rewardEarned).length;

  // Per-subject breakdown
  const subjectStats = subjects.map(s => {
    const sessions = quizEntries.filter(h => h.subject === s.id);
    if (sessions.length === 0) return null;
    const avgPct = Math.round(sessions.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / sessions.length);
    const best = Math.max(...sessions.map(h => Math.round((h.score / h.total) * 100)));
    return { ...s, sessions: sessions.length, avgPct, best };
  }).filter(Boolean);

  return (
    <div className="stats-page">
      {/* Header */}
      <div className="stats-page__header" style={{ '--kid-color': profile.color }}>
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="stats-page__identity">
          <div className="stats-page__avatar">
            {profile.photoUrl
              ? <img src={profile.photoUrl} alt={profile.name} className="stats-page__photo" />
              : <AvatarComponent />}
          </div>
          <div>
            <div className="stats-page__name">{profile.name}</div>
            <div className="stats-page__grade">Grade {profile.grade}</div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats-summary">
        <div className="stats-card" style={{ '--card-color': '#0891b2' }}>
          <div className="stats-card__value">{allTimeMinutes}</div>
          <div className="stats-card__label">min earned all-time</div>
        </div>
        <div className="stats-card" style={{ '--card-color': '#10b981' }}>
          <div className="stats-card__value">${allTimeMoney.toFixed(2)}</div>
          <div className="stats-card__label">money earned all-time</div>
        </div>
        <div className="stats-card" style={{ '--card-color': '#f59e0b' }}>
          <div className="stats-card__value">{totalSessions}</div>
          <div className="stats-card__label">quizzes completed</div>
        </div>
        <div className="stats-card" style={{ '--card-color': '#8b5cf6' }}>
          <div className="stats-card__value">{rewardedSessions > 0 ? Math.round((rewardedSessions / totalSessions) * 100) : 0}%</div>
          <div className="stats-card__label">earned reward</div>
        </div>
      </div>

      {/* Subject breakdown */}
      {subjectStats.length > 0 && (
        <div className="stats-section">
          <h3 className="stats-section__title">📊 By Subject</h3>
          <div className="stats-subjects">
            {subjectStats.map(s => (
              <div key={s.id} className="stats-subject" style={{ '--subject-color': s.color }}>
                <span className="stats-subject__emoji">{s.emoji}</span>
                <div className="stats-subject__info">
                  <div className="stats-subject__name">{s.label}</div>
                  <div className="stats-subject__meta">{s.sessions} session{s.sessions !== 1 ? 's' : ''} · avg {s.avgPct}% · best {s.best}%</div>
                  <div className="stats-subject__bar">
                    <div className="stats-subject__bar-fill" style={{ width: `${s.avgPct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full history */}
      <div className="stats-section">
        <h3 className="stats-section__title">📋 Full History</h3>
        {profile.history.length === 0 ? (
          <div className="stats-empty">No activity yet — start quizzing! 🚀</div>
        ) : (
          <ul className="stats-history">
            {profile.history.map((item, i) => {
              const sub = subjects.find(s => s.id === item.subject);
              let label = '';
              let detail = '';
              let icon = '';

              if (item.type === 'redeem') {
                icon = '⏱'; label = 'Redeemed screen time'; detail = `−${Math.abs(item.earned)} min`;
              } else if (item.type === 'bonus') {
                icon = '✨'; label = 'Bonus minutes'; detail = `+${item.earned} min`;
              } else if (item.type === 'payout') {
                icon = '💵'; label = 'Paid out'; detail = `$${Math.abs(item.moneyEarned ?? 0).toFixed(2)}`;
              } else if (sub) {
                const pct = Math.round((item.score / item.total) * 100);
                icon = sub.emoji;
                label = sub.label;
                detail = `${item.score}/${item.total} (${pct}%)${item.rewardEarned ? ` · +${item.earned} min · +$${(item.moneyEarned ?? 0).toFixed(2)}` : ' · no reward'}`;
              }

              return (
                <li key={i} className="stats-history__item">
                  <span className="stats-history__icon">{icon}</span>
                  <div className="stats-history__body">
                    <span className="stats-history__label">{label}</span>
                    <span className="stats-history__detail">{detail}</span>
                  </div>
                  <span className="stats-history__date">{formatDate(item.date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
