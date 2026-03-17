import { useState } from 'react';
import { subjects } from '../data/questions';
import { useAuth } from '../contexts/AuthContext';

const PROFILE_COLORS = [
  { color: '#0891b2', colorLight: '#cffafe' },
  { color: '#7c3aed', colorLight: '#ede9fe' },
  { color: '#059669', colorLight: '#d1fae5' },
  { color: '#dc2626', colorLight: '#fee2e2' },
];

const PROFILE_EMOJIS = ['⭐', '💜', '🌿', '🔥'];

export default function Onboarding({ onComplete, savedProgress, onSaveProgress }) {
  const { logOut } = useAuth();

  // Initialize from saved progress if resuming
  const [step, setStep] = useState(savedProgress ? savedProgress.completedKids.length + 1 : 0);
  const [numKids, setNumKids] = useState(savedProgress ? savedProgress.numKids : null);
  const [completedKids, setCompletedKids] = useState(savedProgress ? savedProgress.completedKids : []);
  const [current, setCurrent] = useState({ name: '', grade: 6, subjects: [] });

  function handleNumKids(n) {
    setNumKids(n);
    setCompletedKids([]);
    setCurrent({ name: '', grade: 6, subjects: [] });
    setStep(1);
    onSaveProgress({ numKids: n, completedKids: [] });
  }

  function toggleSubject(subId) {
    setCurrent(prev => {
      const has = prev.subjects.includes(subId);
      return {
        ...prev,
        subjects: has ? prev.subjects.filter(s => s !== subId) : [...prev.subjects, subId]
      };
    });
  }

  function handleNext() {
    if (!current.name.trim() || current.subjects.length === 0) return;

    const newKids = [...completedKids, current];

    if (step < numKids) {
      setCompletedKids(newKids);
      setCurrent({ name: '', grade: 6, subjects: [] });
      setStep(step + 1);
      onSaveProgress({ numKids, completedKids: newKids });
    } else {
      const profiles = {};
      newKids.forEach((kid, i) => {
        profiles[`child_${i}`] = {
          name: kid.name.trim(),
          grade: kid.grade,
          subjects: kid.subjects,
          ...PROFILE_COLORS[i],
          emoji: PROFILE_EMOJIS[i],
          avatarIndex: i,
          balance: 0,
          earnings: 0,
          history: []
        };
      });
      onComplete(profiles);
    }
  }

  // ── Welcome screen ──────────────────────────
  if (step === 0) {
    return (
      <div className="onboarding">
        <button className="signout-corner-btn" onClick={logOut}>Sign out</button>
        <div className="onboarding__card">
          <div className="onboarding__hero-emoji">🎓</div>
          <h1 className="onboarding__title">Welcome to<br />Tutor Time!</h1>
          <p className="onboarding__subtitle">
            Kids answer questions to earn screen time and allowance. Let's get your family set up!
          </p>
          <p className="onboarding__question">How many kids will be using the app?</p>
          <div className="onboarding__num-kids">
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                className="onboarding__num-btn"
                onClick={() => handleNumKids(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Kid setup step ─────────────────────────
  const kidIndex = step - 1;
  const isLast = step === numKids;
  const canProceed = current.name.trim().length > 0 && current.subjects.length > 0;

  return (
    <div className="onboarding">
      <button className="signout-corner-btn" onClick={logOut}>Sign out</button>
      <div className="onboarding__card">
        {numKids > 1 && (
          <div className="onboarding__progress">
            {Array.from({ length: numKids }).map((_, i) => (
              <div
                key={i}
                className={`onboarding__progress-dot ${i < kidIndex ? 'done' : ''} ${i === kidIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        <div className="onboarding__hero-emoji">{PROFILE_EMOJIS[kidIndex]}</div>
        <h2 className="onboarding__title">
          {numKids > 1 ? `Kid ${step} of ${numKids}` : "Your Child's Profile"}
        </h2>

        {/* Name */}
        <div className="onboarding__field">
          <label className="onboarding__label">Name</label>
          <input
            className="onboarding__input"
            type="text"
            placeholder="e.g. Emma"
            value={current.name}
            onChange={e => setCurrent(prev => ({ ...prev, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && canProceed && handleNext()}
            autoFocus
          />
        </div>

        {/* Grade */}
        <div className="onboarding__field">
          <label className="onboarding__label">Grade</label>
          <div className="onboarding__grade-grid">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(g => (
              <button
                key={g}
                className={`onboarding__grade-btn ${current.grade === g ? 'selected' : ''}`}
                onClick={() => setCurrent(prev => ({ ...prev, grade: g }))}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="onboarding__field">
          <label className="onboarding__label">
            Subjects
            {current.subjects.length > 0 && (
              <span className="onboarding__label-count"> ({current.subjects.length} selected)</span>
            )}
          </label>
          <div className="onboarding__subjects">
            {subjects.map(s => (
              <button
                key={s.id}
                className={`onboarding__subject-btn ${current.subjects.includes(s.id) ? 'selected' : ''}`}
                style={{ '--sub-color': s.color }}
                onClick={() => toggleSubject(s.id)}
              >
                <span className="onboarding__subject-emoji">{s.emoji}</span>
                <span className="onboarding__subject-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className={`btn btn-primary onboarding__next-btn ${!canProceed ? 'disabled' : ''}`}
          onClick={handleNext}
          disabled={!canProceed}
        >
          {isLast ? '✓ Get Started!' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
