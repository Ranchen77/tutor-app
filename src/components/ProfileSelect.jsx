export default function ProfileSelect({ profiles, onSelect, onParentMode }) {
  const profileEntries = [
    { key: 'daughter1', data: profiles.daughter1 },
    { key: 'daughter2', data: profiles.daughter2 }
  ];

  return (
    <div className="profile-select">
      <div className="profile-select__header">
        <h1 className="profile-select__title">🎓 Tutor Time!</h1>
        <p className="profile-select__subtitle">
          Answer questions correctly to earn screen time ⏱
        </p>
      </div>

      <div className="profile-select__cards">
        {profileEntries.map(({ key, data }) => (
          <div
            key={key}
            className="profile-card"
            style={{ '--profile-color': data.color, '--profile-color-light': data.colorLight }}
            onClick={() => onSelect(key)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onSelect(key)}
            aria-label={`Select ${data.name}'s profile`}
          >
            <span className="profile-card__emoji">{data.emoji}</span>
            <div className="profile-card__name">{data.name}</div>
            <div className="profile-card__grade">Grade {data.grade}</div>
            <div className="profile-card__balance">
              ⏱ {data.balance} minute{data.balance !== 1 ? 's' : ''} available
            </div>
          </div>
        ))}
      </div>

      <div className="profile-select__footer">
        <button className="parent-link" onClick={onParentMode}>
          🔒 Parent Mode
        </button>
      </div>
    </div>
  );
}
