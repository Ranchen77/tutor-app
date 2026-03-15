import { useRef, useState } from 'react';
import { AVATARS } from './Avatars';

const AVATAR_COUNT = AVATARS.length;
const CROP_SIZE = 280; // px — square crop window

// ── Crop modal ────────────────────────────────
function CropModal({ imageSrc, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const fit = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    setScale(fit);
    setReady(true);
  }

  function startDrag(clientX, clientY) {
    dragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  }

  function moveDrag(clientX, clientY) {
    if (!dragging.current) return;
    setOffsetX(x => x + clientX - lastPos.current.x);
    setOffsetY(y => y + clientY - lastPos.current.y);
    lastPos.current = { x: clientX, y: clientY };
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const OUT = 320;
    const ratio = OUT / CROP_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext('2d');
    const dispW = img.naturalWidth * scale;
    const dispH = img.naturalHeight * scale;
    const dx = (CROP_SIZE / 2 + offsetX - dispW / 2) * ratio;
    const dy = (CROP_SIZE / 2 + offsetY - dispH / 2) * ratio;
    ctx.drawImage(img, dx, dy, dispW * ratio, dispH * ratio);
    onConfirm(canvas.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div
      className="crop-overlay"
      onMouseMove={e => moveDrag(e.clientX, e.clientY)}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
    >
      <div className="crop-modal" onClick={e => e.stopPropagation()}>
        <div className="crop-modal__title">Drag &amp; zoom to crop</div>

        <div
          className="crop-window"
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={() => { dragging.current = false; }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageSrc}
            className="crop-image"
            style={{
              transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(${scale})`,
              opacity: ready ? 1 : 0
            }}
            onLoad={handleImgLoad}
            draggable={false}
            alt="crop preview"
          />
          <div className="crop-circle-mask" />
        </div>

        <div className="crop-zoom">
          <span className="crop-zoom__icon">−</span>
          <input
            type="range"
            min={0.3}
            max={4}
            step={0.01}
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
          />
          <span className="crop-zoom__icon">+</span>
        </div>

        <div className="crop-actions">
          <button className="btn btn-ghost" style={{ color: '#374151', border: '2px solid #e5e7eb', background: '#f9fafb' }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            Use Photo ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Individual profile card ───────────────────
function ProfileCard({ profileKey, data, onSelect, onUpdateAvatar, onUpdatePhoto }) {
  const fileInputRef = useRef(null);
  const [cropSrc, setCropSrc] = useState(null);
  const avatarIdx = data.avatarIndex ?? 0;
  const AvatarComponent = AVATARS[avatarIdx];

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => setCropSrc(evt.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <>
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onConfirm={dataUrl => { onUpdatePhoto(profileKey, dataUrl); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />
      )}

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
            /* Photo mode */
            <div className="profile-card__avatar-row">
              <div className="profile-card__avatar">
                <img src={data.photoUrl} alt={data.name} className="profile-card__photo" />
                <span className="profile-card__emoji-badge">{data.emoji}</span>
                <button className="photo-change-btn" onClick={() => fileInputRef.current.click()} title="Change photo">
                  📷
                </button>
              </div>
            </div>
          ) : (
            /* Avatar picker mode */
            <div className="profile-card__avatar-row">
              <button
                className="avatar-arrow"
                onClick={() => onUpdateAvatar(profileKey, (avatarIdx - 1 + AVATAR_COUNT) % AVATAR_COUNT)}
                aria-label="Previous avatar"
              >‹</button>

              <div className="profile-card__avatar">
                <AvatarComponent />
                <span className="profile-card__emoji-badge">{data.emoji}</span>
                <button className="photo-change-btn" onClick={() => fileInputRef.current.click()} title="Upload photo">
                  📷
                </button>
              </div>

              <button
                className="avatar-arrow"
                onClick={() => onUpdateAvatar(profileKey, (avatarIdx + 1) % AVATAR_COUNT)}
                aria-label="Next avatar"
              >›</button>
            </div>
          )}

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

          {data.photoUrl && (
            <button className="photo-remove-btn" onClick={() => onUpdatePhoto(profileKey, null)}>
              ✕ Remove photo
            </button>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <div className="profile-card__name">{data.name}</div>
        <div className="profile-card__grade">Grade {data.grade}</div>
        <div className="profile-card__balance">
          ⏱ {data.balance} minute{data.balance !== 1 ? 's' : ''} available
        </div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────
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
