import { useState, useEffect } from 'react';
import { API } from '../config.js';
import { useLang } from '../LanguageContext.jsx';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const { t } = useLang();

  useEffect(() => {
    fetch(`${API}/api/leaderboard`)
      .then((r) => { if (!r.ok) throw new Error('Erreur serveur'); return r.json(); })
      .then((d) => setLeaderboard(d.leaderboard || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>{t('leaderboard.title')}</h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>{t('leaderboard.subtitle')}</p>
      </div>

      <div className="card overflow-hidden">
        {loading && (
          <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Chargement…</p>
        )}
        {error && (
          <p className="text-center py-12 text-red-400">{error}</p>
        )}

        {!loading && !error && (
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold uppercase tracking-wider border-b" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                <th className="px-4 py-3 w-14 text-center">{t('leaderboard.col.rank')}</th>
                <th className="px-4 py-3">{t('leaderboard.col.player')}</th>
                <th className="px-4 py-3 text-center">Points</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Bon prono</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Score exact</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Matchs joués</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">% Précision</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => {
                const rank = i + 1;
                const isMe = currentUser && row.username === currentUser.username;
                return (
                  <tr
                    key={row.user_id}
                    className="border-b transition-all duration-150"
                    style={{
                      borderColor: 'var(--border)',
                      background: isMe ? 'var(--accent-glow)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = 'var(--bg-input)'; }}
                    onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td className="px-4 py-4 text-center font-bold">
                      {MEDAL[rank] ? (
                        <span className="text-xl">{MEDAL[rank]}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }} className="text-sm">{rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold" style={{ color: 'var(--text)' }}>
                      {row.username}
                      {isMe && (
                        <span className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                          {t('leaderboard.you')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-black text-xl" style={{ color: 'var(--accent)' }}>
                      {row.total_points}
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell" style={{ color: 'var(--text)' }}>
                      {row.bon_prono}
                    </td>
                    <td className="px-4 py-4 text-center hidden md:table-cell" style={{ color: 'var(--text)' }}>
                      {row.score_exact}
                    </td>
                    <td className="px-4 py-4 text-center hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>
                      {row.matchs_joues}
                    </td>
                    <td className="px-4 py-4 text-center hidden lg:table-cell font-semibold" style={{ color: Number(row.precision_pct) >= 50 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {row.matchs_joues > 0 ? `${row.precision_pct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    Aucun pronostic pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
