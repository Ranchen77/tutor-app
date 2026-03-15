import { AVATARS } from './Avatars';

const AVATAR_COUNT = AVATARS.length;

export default function ProfileSelect({ profiles, onSelect, onParentMode, onUpdateAvatar }) {
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
        {profileEntries.map(({ key, data }) => {
          const avatarIdx = data.avatarIndex ?? 0;
          const AvatarComponent = AVATARS[avatarIdx];
          return (
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
              {/* Avatar with picker */}
              <div className="profile-card__avatar-area" onClick={e => e.stopPropagation()}>
                <div className="profile-card__avatar-row">
                  <button
                    className="avatar-arrow"
                    onClick={e => { e.stopPropagation(); onUpdateAvatar(key, (avatarIdx - 1 + AVATAR_COUNT) % AVATAR_COUNT); }}
                    aria-label="Previous avatar"
                  >‹</button>

                  <div className="profile-card__avatar">
                    <AvatarComponent />
                    <span className="profile-card__emoji-badge">{data.emoji}</span>
                  </div>

                  <button
                    className="avatar-arrow"
                    onClick={e => { e.stopPropagation(); onUpdateAvatar(key, (avatarIdx + 1) % AVATAR_COUNT); }}
                    aria-label="Next avatar"
                  >›</button>
                </div>

                <div className="avatar-dots">
                  {AVATARS.map((_, i) => (
                    <button
                      key={i}
                      className={`avatar-dot ${i === avatarIdx ? 'active' : ''}`}
                      onClick={e => { e.stopPropagation(); onUpdateAvatar(key, i); }}
                      aria-label={`Avatar ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="profile-card__name">{data.name}</div>
              <div className="profile-card__grade">Grade {data.grade}</div>
              <div className="profile-card__balance">
                ⏱ {data.balance} minute{data.balance !== 1 ? 's' : ''} available
              </div>
            </div>
          );
        })}
      </div>

      <div className="profile-select__footer">
        <button className="parent-link" onClick={onParentMode}>
          🔒 Parent Mode
        </button>
      </div>
    </div>
  );
}
