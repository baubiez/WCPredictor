import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, authFetch } from '../config.js';

export default function Admin() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState({});
  const [flash, setFlash] = useState({});
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/');
  }, []);

  useEffect(() => {
    fetch(`${API}/api/matches`)
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .catch(() => {});
  }, []);

  const handleScore = (matchId, side, value) => {
    setScores((prev) => ({
      ...prev,
      [matchId]: { home: '', away: '', ...prev[matchId], [side]: value },
    }));
  };

  const handleSubmit = async (matchId) => {
    const s = scores[matchId] || {};
    if (s.home === '' || s.away === '') return;
    setSaving((prev) => ({ ...prev, [matchId]: true }));
    try {
      const res = await authFetch(`${API}/api/matches/${matchId}/result`, {
        method: 'POST',
        body: JSON.stringify({ home_score: Number(s.home), away_score: Number(s.away) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setMatches((prev) =>
        prev.map((m) => m.id === matchId
          ? { ...m, status: 'finished', home_score: Number(s.home), away_score: Number(s.away) }
          : m)
      );
      showFlash(matchId, '✓ Points calculés', false);
    } catch (err) {
      showFlash(matchId, err.message, true);
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const showFlash = (matchId, text, isError) => {
    setFlash((prev) => ({ ...prev, [matchId]: { text, isError } }));
    setTimeout(() => setFlash((prev) => ({ ...prev, [matchId]: null })), 4000);
  };

  const pending  = matches.filter((m) => m.status !== 'finished');
  const finished = matches.filter((m) => m.status === 'finished');
  const displayed = tab === 'pending' ? pending : finished;

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>Interface Admin</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Saisie des résultats — les points sont calculés automatiquement
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'pending',  label: `À saisir (${pending.length})` },
          { key: 'finished', label: `Terminés (${finished.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pill${tab === t.key ? ' active' : ''}`}
            style={tab === t.key ? {} : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          {tab === 'pending' ? 'Tous les matchs ont un résultat.' : 'Aucun match terminé.'}
        </p>
      )}

      <div className="space-y-2">
        {displayed.map((match) => {
          const s   = scores[match.id] || { home: '', away: '' };
          const msg = flash[match.id];

          return (
            <div key={match.id} className="card p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
              {/* Équipes */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="font-semibold truncate w-32 text-right" style={{ color: 'var(--text)' }}>
                  {match.home_team}
                </span>
                {match.status === 'finished' ? (
                  <span className="font-black text-xl w-16 text-center shrink-0" style={{ color: 'var(--accent)' }}>
                    {match.home_score}–{match.away_score}
                  </span>
                ) : (
                  <span className="w-16 text-center shrink-0 text-sm" style={{ color: 'var(--text-muted)' }}>vs</span>
                )}
                <span className="font-semibold truncate w-32" style={{ color: 'var(--text)' }}>
                  {match.away_team}
                </span>
              </div>

              {/* Date */}
              <span className="text-xs hidden md:block w-28 shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>
                {new Date(match.match_datetime).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                })}
              </span>

              {/* Saisie */}
              {match.status !== 'finished' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <input type="number" min="0" max="99" placeholder="0" value={s.home}
                    onChange={(e) => handleScore(match.id, 'home', e.target.value)}
                    className="score-box" />
                  <span className="font-black text-sm" style={{ color: 'var(--text-muted)' }}>:</span>
                  <input type="number" min="0" max="99" placeholder="0" value={s.away}
                    onChange={(e) => handleScore(match.id, 'away', e.target.value)}
                    className="score-box" />
                  <button
                    onClick={() => handleSubmit(match.id)}
                    disabled={saving[match.id] || s.home === '' || s.away === ''}
                    className="btn btn-primary text-sm px-4 py-1.5">
                    {saving[match.id] ? '…' : 'Valider'}
                  </button>
                  {msg && (
                    <span className={`text-xs ${msg.isError ? 'text-red-400' : 'text-green-400'}`}>
                      {msg.text}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-sm font-semibold text-green-400 shrink-0">✓ Scoré</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
