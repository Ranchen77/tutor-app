import { useRef } from 'react';
import { AVATARS } from './Avatars';

const AVATAR_COUNT = AVATARS.length;

function compressPhoto(file, callback) {
  const reader = new FileReader();
  reader.onload = evt => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 240;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const min = Math.min(img.width, img.height);
      const sx = (img.width - min) / 2;
      const sy = (img.height - min) / 2;
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
      callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function ProfileCard({ profileKey, data, onSelect, onUpdateAvatar, onUpdatePhoto }) {
  const fileInputRef = useRef(null);
  const avatarIdx = data.avatarIndex ?? 0;
  const AvatarComponent = AVATARS[avatarIdx];

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    compressPhoto(file, dataUrl => onUpdatePhoto(profileKey, dataUrl));
    e.target.value = '';
  }

  return (
    <div
      className="profile-card"
      style={{ '--profile-color': data.color, '--profile-color-light': data.colorLight }}
      onClick={() => onSelect(profileKey)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(profileKey)}
      aria-label={`Select ${data.name}'s profile`}
    >
      <div className="profile-card__avatar-area" onClick={e => e.stopPropagation()}>

        {data.photoUrl ? (
          /* ── Photo mode ── */
          <div className="profile-card__avatar-row">
            <div className="profile-card__avatar">
              <img src={data.photoUrl} alt={data.name} className="profile-card__photo" />
              <span className="profile-card__emoji-badge">{data.emoji}</span>
              <button
                className="photo-change-btn"
                onClick={() => fileInputRef.current.click()}
                title="Change photo"
              >📷</button>
            </div>
          </div>
        ) : (
          /* ── Avatar picker mode ── */
          <div className="profile-card__avatar-row">
            <button
              className="avatar-arrow"
              onClick={() => onUpdateAvatar(profileKey, (avatarIdx - 1 + AVATAR_COUNT) % AVATAR_COUNT)}
              aria-label="Previous avatar"
            >‹</button>

            <div className="profile-card__avatar">
              <AvatarComponent />
              <span className="profile-card__emoji-badge">{data.emoji}</span>
              <button
                className="photo-change-btn"
                onClick={() => fileInputRef.current.click()}
                title="Upload photo"
              >📷</button>
            </div>

            <button
              className="avatar-arrow"
              onClick={() => onUpdateAvatar(profileKey, (avatarIdx + 1) % AVATAR_COUNT)}
              aria-label="Next avatar"
            >›</button>
          </div>
        )}

        {/* Dot indicators — only shown in avatar mode */}
        {!data.photoUrl && (
          <div className="avatar-dots">
            {AVATARS.map((_, i) => (
              <button
                key={i}
                className={`avatar-dot ${i === avatarIdx ? 'active' : ''}`}
                onClick={() => onUpdateAvatar(profileKey, i)}
                aria-label={`Avatar ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Remove photo link */}
        {data.photoUrl && (
          <button
            className="photo-remove-btn"
            onClick={() => onUpdatePhoto(profileKey, null)}
          >✕ Remove photo</button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="profile-card__name">{data.name}</div>
      <div className="profile-card__grade">Grade {data.grade}</div>
      <div className="profile-card__balance">
        ⏱ {data.balance} minute{data.balance !== 1 ? 's' : ''} available
      </div>
    </div>
  );
}

export default function ProfileSelect({ profiles, onSelect, onParentMode, onUpdateAvatar, onUpdatePhoto }) {
  return (
    <div className="profile-select">
      <div className="profile-select__header">
        <h1 className="profile-select__title">🎓 Tutor Time!</h1>
        <p className="profile-select__subtitle">
          Answer questions correctly to earn screen time ⏱
        </p>
      </div>

      <div className="profile-select__cards">
        {[
          { key: 'daughter1', data: profiles.daughter1 },
          { key: 'daughter2', data: profiles.daughter2 }
        ].map(({ key, data }) => (
          <ProfileCard
            key={key}
            profileKey={key}
            data={data}
            onSelect={onSelect}
            onUpdateAvatar={onUpdateAvatar}
            onUpdatePhoto={onUpdatePhoto}
          />
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
