import { useState, useEffect } from 'react';
import { notifyParent } from './utils/notify';
import './index.css';
import ProfileSelect from './components/ProfileSelect';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import Results from './components/Results';
import ParentPanel from './components/ParentPanel';

// ── Default State ──────────────────────────────
const defaultProfiles = {
  daughter1: {
    name: 'Lilah',
    grade: 6,
    emoji: '🌟',
    color: '#0891b2',
    colorLight: '#cffafe',
    balance: 0,
    earnings: 0,
    avatarIndex: 0,
    history: []
  },
  daughter2: {
    name: 'Emma',
    grade: 9,
    emoji: '💜',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    balance: 0,
    earnings: 0,
    avatarIndex: 1,
    history: []
  }
};

const defaultSettings = {
  minutesPerSession: 10,
  dailyMax: 90,
  parentPin: '1234'
};

// ── Views ──────────────────────────────────────
// 'home' | 'dashboard' | 'quiz' | 'results' | 'parent'

export default function App() {
  // ── Persistent state ─────────────────────────
  const [profiles, setProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('tutorProfiles');
      return saved ? JSON.parse(saved) : defaultProfiles;
    } catch {
      return defaultProfiles;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tutorSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('tutorProfiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('tutorSettings', JSON.stringify(settings));
  }, [settings]);

  // ── Navigation state ─────────────────────────
  const [view, setView] = useState('home');
  const [activeProfile, setActiveProfile] = useState(null); // 'daughter1' | 'daughter2'
  const [activeSubject, setActiveSubject] = useState(null);
  const [quizResult, setQuizResult] = useState(null); // { score, earned, newBalance }

  // ── Navigation helpers ────────────────────────
  function goHome() {
    setView('home');
    setActiveProfile(null);
    setActiveSubject(null);
    setQuizResult(null);
  }

  function selectProfile(profileKey) {
    setActiveProfile(profileKey);
    setView('dashboard');
  }

  function selectSubject(subject) {
    setActiveSubject(subject);
    setView('quiz');
  }

  function finishQuiz(score, totalQuestions) {
    const profileKey = activeProfile;
    const profile = profiles[profileKey];
    const today = new Date().toISOString().slice(0, 10);

    // Grade must be B or better (≥80%) to earn rewards
    const percent = Math.round((score / totalQuestions) * 100);
    const qualifies = percent >= 80;

    // Has this subject already been rewarded today?
    const alreadyEarned = profile.history.some(
      h => h.date.startsWith(today) && h.subject === activeSubject && h.rewardEarned
    );

    const shouldReward = qualifies && !alreadyEarned;

    // Minutes
    const todayMinutes = profile.history
      .filter(h => h.date.startsWith(today) && !h.type && h.earned > 0)
      .reduce((sum, h) => sum + h.earned, 0);
    const remaining = Math.max(0, settings.dailyMax - todayMinutes);
    const earned = shouldReward ? Math.min(settings.minutesPerSession, remaining) : 0;
    const newBalance = profile.balance + earned;

    // Money: $0.10 per qualifying section, once per section
    const moneyEarned = shouldReward ? 0.10 : 0;
    const newEarnings = parseFloat(((profile.earnings ?? 0) + moneyEarned).toFixed(2));

    const historyEntry = {
      date: new Date().toISOString(),
      subject: activeSubject,
      score,
      total: totalQuestions,
      earned,
      moneyEarned,
      balance: newBalance,
      rewardEarned: shouldReward
    };

    setProfiles(prev => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        balance: newBalance,
        earnings: newEarnings,
        history: [historyEntry, ...prev[profileKey].history].slice(0, 50)
      }
    }));

    setQuizResult({
      score,
      totalQuestions,
      earned,
      moneyEarned,
      newBalance,
      newEarnings,
      todayEarned: todayMinutes + earned,
      dailyMax: settings.dailyMax,
      cappedOut: remaining === 0,
      qualifies,
      alreadyEarned
    });
    setView('results');

    notifyParent(profile.name, activeSubject, score, totalQuestions);
  }

  function redeemTime(profileKey, minutes) {
    setProfiles(prev => {
      const current = prev[profileKey].balance;
      const deduct = Math.min(minutes, current);
      const historyEntry = {
        date: new Date().toISOString(),
        subject: null,
        score: null,
        total: null,
        earned: -deduct,
        balance: current - deduct,
        type: 'redeem'
      };
      return {
        ...prev,
        [profileKey]: {
          ...prev[profileKey],
          balance: current - deduct,
          history: [historyEntry, ...prev[profileKey].history].slice(0, 50)
        }
      };
    });
  }

  function payOutEarnings(profileKey) {
    setProfiles(prev => {
      const amount = prev[profileKey].earnings ?? 0;
      if (amount === 0) return prev;
      const historyEntry = {
        date: new Date().toISOString(),
        subject: null, score: null, total: null,
        earned: 0, moneyEarned: -amount,
        balance: prev[profileKey].balance,
        type: 'payout'
      };
      return {
        ...prev,
        [profileKey]: {
          ...prev[profileKey],
          earnings: 0,
          history: [historyEntry, ...prev[profileKey].history].slice(0, 50)
        }
      };
    });
  }

  function addBonus(profileKey, minutes) {
    setProfiles(prev => {
      const current = prev[profileKey].balance;
      const newBal = current + minutes;
      const historyEntry = {
        date: new Date().toISOString(),
        subject: null,
        score: null,
        total: null,
        earned: minutes,
        balance: newBal,
        type: 'bonus'
      };
      return {
        ...prev,
        [profileKey]: {
          ...prev[profileKey],
          balance: newBal,
          history: [historyEntry, ...prev[profileKey].history].slice(0, 50)
        }
      };
    });
  }

  function updateAvatar(profileKey, avatarIndex) {
    setProfiles(prev => ({
      ...prev,
      [profileKey]: { ...prev[profileKey], avatarIndex }
    }));
  }

  function updatePhoto(profileKey, photoUrl) {
    setProfiles(prev => ({
      ...prev,
      [profileKey]: { ...prev[profileKey], photoUrl: photoUrl ?? undefined }
    }));
  }

  // ── Render ────────────────────────────────────
  return (
    <div className="app">
      {view === 'home' && (
        <ProfileSelect
          profiles={profiles}
          onSelect={selectProfile}
          onParentMode={() => setView('parent')}
          onUpdateAvatar={updateAvatar}
          onUpdatePhoto={updatePhoto}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          profile={profiles[activeProfile]}
          onSelectSubject={selectSubject}
          onBack={goHome}
          onParentMode={() => setView('parent')}
        />
      )}

      {view === 'quiz' && (
        <Quiz
          profile={profiles[activeProfile]}
          subject={activeSubject}
          onFinish={finishQuiz}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'results' && quizResult && (
        <Results
          profile={profiles[activeProfile]}
          subject={activeSubject}
          result={quizResult}
          onPlayAgain={() => setView('quiz')}
          onChooseSubject={() => setView('dashboard')}
        />
      )}

      {view === 'parent' && (
        <ParentPanel
          profiles={profiles}
          settings={settings}
          onUpdateSettings={setSettings}
          onRedeem={redeemTime}
          onAddBonus={addBonus}
          onPayOut={payOutEarnings}
          onBack={goHome}
        />
      )}
    </div>
  );
}
