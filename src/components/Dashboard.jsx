import { subjects } from '../data/questions';

export default function Dashboard({ profile, onSelectSubject, onBack, onParentMode }) {
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <span className="dashboard__avatar">{profile.emoji}</span>
        <div className="dashboard__info">
          <h1>{profile.name}</h1>
          <p>Grade {profile.grade}</p>
        </div>
        <div className="dashboard__header-right">
          <button className="parent-mode-btn" onClick={onParentMode}>
            🔒 Parent Mode
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div
        className="dashboard__balance-card"
        style={{ background: `linear-gradient(135deg, ${profile.color}, ${adjustColor(profile.color)})` }}
      >
        <div className="dashboard__balance-glow" />
        <div className="dashboard__balance-label">Screen Time Earned</div>
        <div className="dashboard__balance-number">{profile.balance}</div>
        <div className="dashboard__balance-unit">
          minute{profile.balance !== 1 ? 's' : ''} ⏱
        </div>
      </div>

      {/* Subjects */}
      <div className="dashboard__section-title">Choose a Subject</div>
      <div className="subjects-grid">
        {subjects.map(subject => (
          <div
            key={subject.id}
            className="subject-card"
            style={{ '--subject-color': subject.color }}
            onClick={() => onSelectSubject(subject.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelectSubject(subject.id)}
          >
            <span className="subject-card__emoji">{subject.emoji}</span>
            <div className="subject-card__label">{subject.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Slightly darken a hex color for gradient
function adjustColor(hex) {
  // Shift hue/darken for gradient end
  const map = {
    '#0891b2': '#0e7490',
    '#7c3aed': '#5b21b6'
  };
  return map[hex] || hex;
}
