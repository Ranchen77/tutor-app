import { subjects } from '../data/questions';
import { ArrowLeft, Lock } from './Icons';
import { AVATARS } from './Avatars';

export default function Dashboard({ profile, onSelectSubject, onBack, onParentMode }) {
  const AvatarComponent = AVATARS[profile.avatarIndex ?? 0];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="dashboard__avatar-wrap">
          {profile.photoUrl
            ? <img src={profile.photoUrl} alt={profile.name} className="dashboard__avatar-img" />
            : <div className="dashboard__avatar-svg"><AvatarComponent /></div>}
        </div>

        <div className="dashboard__info">
          <h1>{profile.name}</h1>
          <p>Grade {profile.grade}</p>
        </div>
        <div className="dashboard__header-right">
          <button className="parent-mode-btn" onClick={onParentMode}>
            <Lock size={14} /> Parent Mode
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="dashboard__balances">
        <div
          className="dashboard__balance-card"
          style={{ background: `linear-gradient(135deg, ${profile.color}, ${adjustColor(profile.color)})` }}
        >
          <div className="dashboard__balance-glow" />
          <div className="dashboard__balance-label">Screen Time</div>
          <div className="dashboard__balance-number">{profile.balance}</div>
          <div className="dashboard__balance-unit">
            minute{profile.balance !== 1 ? 's' : ''} ⏱
          </div>
        </div>
        <div className="dashboard__balance-card dashboard__balance-card--money">
          <div className="dashboard__balance-label">Earnings</div>
          <div className="dashboard__balance-number">${((profile.earnings ?? 0)).toFixed(2)}</div>
          <div className="dashboard__balance-unit">dollars 💰</div>
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

function adjustColor(hex) {
  const map = { '#0891b2': '#0e7490', '#7c3aed': '#5b21b6' };
  return map[hex] || hex;
}
