import { useState, useEffect } from 'react';
import { API } from '../config.js';
import { useLang } from '../LanguageContext.jsx';

const PODIUM = [
  { rank: 2, medal: '🥈', color: '#7C7C94', height: 88,  avatarSize: 50, fontSize: 18 },
  { rank: 1, medal: '🥇', color: '#C8A02A', height: 120, avatarSize: 62, fontSize: 24 },
  { rank: 3, medal: '🥉', color: '#A0624A', height: 64,  avatarSize: 50, fontSize: 18 },
];

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const { t } = useLang();

  useEffect(() => {
    fetch(`${API}/api/leaderboard`)
      .then((r) => { if (!r.ok) throw new Error('Erreur serveur'); return r.json(); })
      .then((d) => setLeaderboard(d.leaderboard || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const top3  = leaderboard.slice(0, 3);
  const rest  = leaderboard.slice(3);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>
          {t('leaderboard.title')}
        </h2>
        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
          {t('leaderboard.subtitle')}
        </p>
      </div>

      {loading && (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>{t('common.loading')}</p>
      )}
      {error && <p className="text-center py-12 text-red-400">{error}</p>}

      {!loading && !error && leaderboard.length === 0 && (
        <p className="text-center py-12" style={{ color: 'var(--text-muted)' }}>{t('leaderboard.empty')}</p>
      )}

      {!loading && !error && leaderboard.length > 0 && (
        <>
          {/* ── Podium top 3 ── */}
          <div className="flex items-end justify-center gap-4 mb-10 px-4">
            {PODIUM.map((cfg, i) => {
              const row = top3[cfg.rank - 1];
              if (!row) return <div key={i} style={{ width: 110 }} />;
              const isMe = currentUser && row.username === currentUser.username;
              return (
                <div key={row.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: cfg.rank === 1 ? 130 : 110 }}>
                  {/* Avatar */}
                  <div style={{
                    width: cfg.avatarSize, height: cfg.avatarSize, borderRadius: '50%',
                    background: `${cfg.color}22`, border: `2.5px solid ${cfg.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: cfg.fontSize, color: cfg.color, marginBottom: 8,
                  }}>
                    {row.username.charAt(0).toUpperCase()}
                  </div>
                  {/* Nom */}
                  <p style={{ margin: '0 0 3px', fontSize: 13, fontWeight: 700, color: 'var(--text)', textAlign: 'center', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.username}
                  </p>
                  {isMe && (
                    <p style={{ margin: '0 0 4px', fontSize: 10, color: 'var(--accent)', fontWeight: 700, textAlign: 'center' }}>
                      {t('leaderboard.you')}
                    </p>
                  )}
                  {/* Colonne podium */}
                  <div style={{
                    width: '100%', height: cfg.height,
                    background: cfg.color, borderRadius: '10px 10px 0 0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  }}>
                    <span style={{ fontSize: 22 }}>{cfg.medal}</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{row.total_points}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Table rangs 4+ ── */}
          {rest.length > 0 && (
            <div className="card overflow-hidden">
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 80px 80px 80px 80px 100px', padding: '10px 18px', background: 'var(--bg-input)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)' }}>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.rank')}</span>
                <span>{t('leaderboard.col.player')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.points')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.correct')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.exact')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.scored')}</span>
                <span style={{ textAlign: 'center' }}>{t('leaderboard.col.precision')}</span>
              </div>
              {/* Rows */}
              {rest.map((row, i) => {
                const rank = i + 4;
                const isMe = currentUser && row.username === currentUser.username;
                return (
                  <div key={row.user_id}
                    style={{ display: 'grid', gridTemplateColumns: '56px 1fr 80px 80px 80px 80px 100px', alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid var(--border)', background: isMe ? 'rgba(217,119,6,0.09)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = 'var(--bg-input)'; }}
                    onMouseLeave={(e) => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--text-muted)' }}>{rank}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.username}</span>
                      {isMe && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'var(--accent-glow)', color: 'var(--accent)', flexShrink: 0 }}>{t('leaderboard.you')}</span>}
                    </span>
                    <span style={{ textAlign: 'center', fontWeight: 900, fontSize: 18, color: 'var(--accent)' }}>{row.total_points}</span>
                    <span style={{ textAlign: 'center', color: 'var(--text)' }}>{row.bon_prono}</span>
                    <span style={{ textAlign: 'center', color: 'var(--text)' }}>{row.score_exact}</span>
                    <span style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{row.matchs_joues}</span>
                    <span style={{ textAlign: 'center', fontWeight: 700, color: Number(row.precision_pct) >= 50 ? 'var(--accent)' : 'var(--text-muted)' }}>
                      {row.matchs_joues > 0 ? `${row.precision_pct}%` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
