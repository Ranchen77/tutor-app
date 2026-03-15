import { useState } from 'react';
import { subjects } from '../data/questions';

const PIN_LENGTH = 4;

export default function ParentPanel({ profiles, settings, onUpdateSettings, onRedeem, onAddBonus, onBack }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [errorKey, setErrorKey] = useState(0); // re-mount for shake animation

  // Redeem / bonus inputs
  const [redeemValues, setRedeemValues] = useState({ daughter1: '', daughter2: '' });
  const [bonusValues, setBonusValues] = useState({ daughter1: '', daughter2: '' });

  // Settings
  const [mpcInput, setMpcInput] = useState(String(settings.minutesPerCorrect));
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [settingMsg, setSettingMsg] = useState('');

  // ── PIN logic ────────────────────────────────
  function handlePinKey(digit) {
    if (pinInput.length >= PIN_LENGTH) return;
    const next = pinInput + digit;
    setPinInput(next);

    if (next.length === PIN_LENGTH) {
      if (next === settings.parentPin) {
        setUnlocked(true);
        setPinError('');
      } else {
        setTimeout(() => {
          setPinError('Incorrect PIN. Try again.');
          setErrorKey(k => k + 1);
          setPinInput('');
        }, 300);
      }
    }
  }

  function handlePinDelete() {
    setPinInput(prev => prev.slice(0, -1));
  }

  // ── Parent actions ───────────────────────────
  function handleRedeem(key) {
    const val = parseInt(redeemValues[key], 10);
    if (!val || val <= 0) return;
    onRedeem(key, val);
    setRedeemValues(prev => ({ ...prev, [key]: '' }));
  }

  function handleBonus(key) {
    const val = parseInt(bonusValues[key], 10);
    if (!val || val <= 0) return;
    onAddBonus(key, val);
    setBonusValues(prev => ({ ...prev, [key]: '' }));
  }

  function handleSaveMpc() {
    const val = parseInt(mpcInput, 10);
    if (!val || val <= 0) { setSettingMsg('Enter a positive number.'); return; }
    onUpdateSettings(prev => ({ ...prev, minutesPerCorrect: val }));
    setSettingMsg('✓ Minutes per correct answer updated!');
    setTimeout(() => setSettingMsg(''), 3000);
  }

  function handleChangePin() {
    if (newPin.length !== PIN_LENGTH || !/^\d{4}$/.test(newPin)) {
      setSettingMsg('PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setSettingMsg('PINs do not match.');
      return;
    }
    onUpdateSettings(prev => ({ ...prev, parentPin: newPin }));
    setNewPin('');
    setConfirmPin('');
    setSettingMsg('✓ PIN changed successfully!');
    setTimeout(() => setSettingMsg(''), 3000);
  }

  // ── Shared history across both kids ──────────
  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function formatHistoryItem(item, profileName, profileColor) {
    let text = '';
    if (item.type === 'redeem') {
      text = `${profileName} redeemed ${Math.abs(item.earned)} min`;
    } else if (item.type === 'bonus') {
      text = `${profileName} got ${item.earned} bonus min`;
    } else if (item.subject) {
      const sub = subjects.find(s => s.id === item.subject);
      text = `${profileName} scored ${item.score}/${item.total} in ${sub?.label ?? item.subject} (+${item.earned} min)`;
    } else {
      text = `${profileName}: ${item.earned > 0 ? '+' : ''}${item.earned} min`;
    }
    return { text, color: profileColor };
  }

  // Merge and sort history
  const allHistory = [
    ...profiles.daughter1.history.map(h => ({
      ...h,
      profileName: profiles.daughter1.name,
      profileColor: profiles.daughter1.color
    })),
    ...profiles.daughter2.history.map(h => ({
      ...h,
      profileName: profiles.daughter2.name,
      profileColor: profiles.daughter2.color
    }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // ── Render: PIN screen ───────────────────────
  if (!unlocked) {
    return (
      <div className="parent-panel">
        <div className="parent-panel__header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2 className="parent-panel__title">Parent Mode</h2>
        </div>

        <div className="pin-screen">
          <div className="pin-screen__lock">🔒</div>
          <div className="pin-screen__title">Enter PIN</div>
          <div className="pin-screen__subtitle">Enter your 4-digit parent PIN</div>

          {/* Dots */}
          <div className="pin-dots">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div key={i} className={`pin-dot ${i < pinInput.length ? 'filled' : ''}`} />
            ))}
          </div>

          {/* Keypad */}
          <div className="pin-keypad">
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} className="pin-key" onClick={() => handlePinKey(d)}>{d}</button>
            ))}
            <button className="pin-key" style={{ opacity: 0.3, cursor: 'default' }} disabled />
            <button className="pin-key" onClick={() => handlePinKey('0')}>0</button>
            <button className="pin-key del" onClick={handlePinDelete}>⌫ Del</button>
          </div>

          {pinError && (
            <div key={errorKey} className="pin-error">{pinError}</div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Dashboard ────────────────────────
  return (
    <div className="parent-panel">
      <div className="parent-panel__header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="parent-panel__title">👨‍👩‍👧‍👧 Parent Panel</h2>
        <button
          className="btn"
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.4)', padding: '8px 16px', fontSize: '0.85rem' }}
          onClick={() => setUnlocked(false)}
        >
          🔒 Lock
        </button>
      </div>

      {/* Kids' Balance Cards */}
      <div className="parent-panel__kids">
        {[
          { key: 'daughter1', data: profiles.daughter1 },
          { key: 'daughter2', data: profiles.daughter2 }
        ].map(({ key, data }) => (
          <div
            key={key}
            className="kid-card"
            style={{ '--kid-color': data.color }}
          >
            <div className="kid-card__header">
              <span className="kid-card__emoji">{data.emoji}</span>
              <div>
                <div className="kid-card__name">{data.name}</div>
                <div className="kid-card__grade">Grade {data.grade}</div>
              </div>
            </div>

            <div className="kid-card__balance">{data.balance}</div>
            <div className="kid-card__balance-label">minutes available</div>

            {/* Redeem */}
            <div className="kid-action-label">Redeem screen time</div>
            <div className="kid-action-row">
              <input
                type="number"
                min="1"
                placeholder="mins"
                value={redeemValues[key]}
                onChange={e => setRedeemValues(prev => ({ ...prev, [key]: e.target.value }))}
              />
              <button className="btn-redeem" onClick={() => handleRedeem(key)}>
                Redeem ⏱
              </button>
            </div>

            {/* Bonus */}
            <div className="kid-action-label" style={{ marginTop: 8 }}>Add bonus minutes</div>
            <div className="kid-action-row">
              <input
                type="number"
                min="1"
                placeholder="mins"
                value={bonusValues[key]}
                onChange={e => setBonusValues(prev => ({ ...prev, [key]: e.target.value }))}
              />
              <button className="btn-add" onClick={() => handleBonus(key)}>
                Add ✨
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div className="parent-panel__section">
        <h3>📋 Recent Activity</h3>
        {allHistory.length === 0 ? (
          <div className="history-empty">No activity yet. Start quizzing!</div>
        ) : (
          <ul className="history-list">
            {allHistory.map((item, i) => {
              const { text, color } = formatHistoryItem(item, item.profileName, item.profileColor);
              return (
                <li key={i} className="history-item">
                  <div className="history-item__dot" style={{ background: color }} />
                  <span className="history-item__text">{text}</span>
                  <span className="history-item__date">{formatDate(item.date)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Settings */}
      <div className="parent-panel__section">
        <h3>⚙️ Settings</h3>

        <div className="settings-row">
          <label>Minutes per correct answer:</label>
          <input
            type="number"
            min="1"
            value={mpcInput}
            onChange={e => setMpcInput(e.target.value)}
          />
          <button onClick={handleSaveMpc}>Save</button>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>🔐 Change PIN</h3>

        <div className="settings-row">
          <label>New PIN (4 digits):</label>
          <input
            type="password"
            maxLength={4}
            placeholder="1234"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>

        <div className="settings-row">
          <label>Confirm new PIN:</label>
          <input
            type="password"
            maxLength={4}
            placeholder="1234"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <button onClick={handleChangePin}>Change PIN</button>
        </div>

        {settingMsg && (
          <div className="settings-success">{settingMsg}</div>
        )}
      </div>
    </div>
  );
}
