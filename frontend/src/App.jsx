import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import Matches from './pages/Matches';
import Stats from './pages/Stats';
import Admin from './pages/Admin';

/* ── Home ── */
function Home() {
  const isLoggedIn = !!localStorage.getItem('user');
  if (isLoggedIn) return <Navigate to="/matches" replace />;

  return (
    <div className="max-w-3xl mx-auto mt-16 text-center px-4">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
          style={{ background: 'var(--accent-glow)', border: '2px solid var(--accent)' }}>
          <span className="text-4xl">⚽</span>
        </div>
        <h1 className="text-5xl font-black mt-2 tracking-tight"
          style={{ color: 'var(--text)' }}>
          WC<span style={{ color: 'var(--accent)' }}>Predictor</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mt-3 text-lg">
          Coupe du Monde 2026 — Faites vos pronostics et affrontez vos amis !
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 my-10">
        {[
          { n: '48', label: 'Équipes' },
          { n: '104', label: 'Matchs' },
          { n: '3', label: 'Pts max / match' },
        ].map((s) => (
          <div key={s.n} className="card p-5">
            <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{s.n}</p>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <Link to="/register" className="btn btn-primary text-base px-8 py-3">
          Créer un compte
        </Link>
        <Link to="/login" className="btn btn-ghost text-base px-8 py-3">
          Se connecter
        </Link>
      </div>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        {[
          { pts: '3 pts', label: 'Score exact',  desc: 'Le score exact du match', color: 'var(--accent)' },
          { pts: '1 pt',  label: 'Bon résultat', desc: 'Le bon vainqueur ou nul', color: '#22c55e' },
          { pts: '0 pt',  label: 'Raté',          desc: 'Pronostic incorrect',     color: '#ef4444' },
        ].map((r) => (
          <div key={r.pts} className="card p-5">
            <p className="text-2xl font-black" style={{ color: r.color }}>{r.pts}</p>
            <p className="font-semibold mt-1" style={{ color: 'var(--text)' }}>{r.label}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── NavBar ── */
function NavBar({ dark, onToggle }) {
  const isLoggedIn = !!localStorage.getItem('user');
  const location = useLocation();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      className={`nav-link${location.pathname === to ? ' active' : ''}`}
    >
      {label}
    </Link>
  );

  return (
    <nav style={{ backgroundColor: 'var(--bg-nav)' }} className="px-6 py-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-lg font-black tracking-tight text-white">
            WC<span style={{ color: 'var(--accent)' }}>Predictor</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              {navLink('/matches', 'Matchs')}
              {navLink('/stats', 'Stats')}
              {navLink('/leaderboard', 'Classement')}
              {navLink('/dashboard', 'Tableau de bord')}
              {user?.role === 'admin' && navLink('/admin', 'Admin')}
            </>
          ) : (
            <>
              {navLink('/login', 'Se connecter')}
              <Link to="/register" className="btn btn-primary text-sm px-4 py-2">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Dark mode toggle */}
        <button className="theme-toggle" onClick={onToggle} title={dark ? 'Mode clair' : 'Mode nuit'}>
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}

/* ── App ── */
export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div className={dark ? 'dark' : ''}>
      <Router>
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
          <NavBar dark={dark} onToggle={toggleDark} />

          <main className="max-w-6xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />

              <Route path="/matches"     element={<ProtectedRoute><Matches /></ProtectedRoute>} />
              <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/stats"       element={<ProtectedRoute><Stats /></ProtectedRoute>} />
              <Route path="/admin"       element={<ProtectedRoute><Admin /></ProtectedRoute>} />

              <Route path="*" element={
                <div className="text-center mt-24">
                  <p className="text-8xl font-black" style={{ color: 'var(--border)' }}>404</p>
                  <p className="text-xl mt-4" style={{ color: 'var(--text-muted)' }}>Cette page n'existe pas.</p>
                  <Link to="/" className="btn btn-primary inline-flex mt-8 px-6 py-3">
                    Retour à l'accueil
                  </Link>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}
