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
    history: []
  },
  daughter2: {
    name: 'Emma',
    grade: 9,
    emoji: '💜',
    color: '#7c3aed',
    colorLight: '#ede9fe',
    balance: 0,
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

    // Sum minutes already earned today (quiz sessions only, not bonuses)
    const today = new Date().toISOString().slice(0, 10);
    const todayEarned = profile.history
      .filter(h => h.date.startsWith(today) && !h.type && h.earned > 0)
      .reduce((sum, h) => sum + h.earned, 0);

    const remaining = Math.max(0, settings.dailyMax - todayEarned);
    const earned = Math.min(settings.minutesPerSession, remaining);
    const newBalance = profile.balance + earned;
    const newTodayEarned = todayEarned + earned;

    const historyEntry = {
      date: new Date().toISOString(),
      subject: activeSubject,
      score,
      total: totalQuestions,
      earned,
      balance: newBalance
    };

    setProfiles(prev => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        balance: newBalance,
        history: [historyEntry, ...prev[profileKey].history].slice(0, 50)
      }
    }));

    setQuizResult({
      score,
      totalQuestions,
      earned,
      newBalance,
      todayEarned: newTodayEarned,
      dailyMax: settings.dailyMax,
      cappedOut: remaining === 0
    });
    setView('results');

    // Notify parent by SMS
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

  // ── Render ────────────────────────────────────
  return (
    <div className="app">
      {view === 'home' && (
        <ProfileSelect
          profiles={profiles}
          onSelect={selectProfile}
          onParentMode={() => setView('parent')}
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
          onBack={goHome}
        />
      )}
    </div>
  );
}
