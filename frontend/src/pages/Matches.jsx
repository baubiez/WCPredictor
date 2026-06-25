import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API, authFetch } from '../config.js';

const STAGE_LABEL = {
  group:   'Phase de groupes',
  round32: 'Seizièmes de finale',
  round16: 'Huitièmes de finale',
  quarter: 'Quarts de finale',
  semi:    'Demi-finales',
  final:   'Finale',
};
const STAGE_ORDER = ['group', 'round32', 'round16', 'quarter', 'semi', 'final'];

const STATUS_STYLE = {
  scheduled: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  live:      { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e', border: 'rgba(34,197,94,0.35)' },
  finished:  { bg: 'var(--bg-input)',        color: 'var(--text-muted)', border: 'var(--border)' },
};
const STATUS_LABEL = { scheduled: 'À venir', live: 'En direct', finished: 'Terminé' };

const badgeClass = (pts) => {
  if (pts === 3) return 'badge-exact';
  if (pts === 1) return 'badge-correct';
  if (pts === 0) return 'badge-wrong';
  return 'badge-pending';
};

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [botPredictions, setBotPredictions] = useState({});
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState({});
  const [flash, setFlash] = useState({});
  const { state } = useLocation();
  const [groupFilter, setGroupFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(state?.statusFilter ?? 'all');

  useEffect(() => {
    loadMatches();
    loadPredictions();
    loadBotPredictions();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await fetch(`${API}/api/matches`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch { /* réseau */ }
  };

  const loadBotPredictions = async () => {
    try {
      const res = await fetch(`${API}/api/bot-predictions`);
      const data = await res.json();
      const map = {};
      (data.predictions || []).forEach((p) => { map[p.match_id] = p; });
      setBotPredictions(map);
    } catch { /* service IA pas lancé */ }
  };

  const loadPredictions = async () => {
    try {
      const res = await authFetch(`${API}/api/predictions`);
      const data = await res.json();
      const predMap = {}, inputMap = {};
      (data.predictions || []).forEach((p) => {
        predMap[p.match_id] = p;
        inputMap[p.match_id] = { home: String(p.pred_home), away: String(p.pred_away) };
      });
      setPredictions(predMap);
      setInputs(inputMap);
    } catch { /* réseau */ }
  };

  const handleInput = (matchId, side, value) => {
    setInputs((prev) => ({
      ...prev,
      [matchId]: { home: prev[matchId]?.home ?? '', away: prev[matchId]?.away ?? '', ...prev[matchId], [side]: value },
    }));
  };

  const handleSave = async (matchId) => {
    const inp = inputs[matchId] || {};
    if (inp.home === '' || inp.away === '') return;
    setSaving((prev) => ({ ...prev, [matchId]: true }));
    try {
      const res = await authFetch(`${API}/api/predictions`, {
        method: 'POST',
        body: JSON.stringify({ match_id: matchId, pred_home: Number(inp.home), pred_away: Number(inp.away) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setPredictions((prev) => ({ ...prev, [matchId]: { ...prev[matchId], ...data.prediction } }));
      showFlash(matchId, '✓ Enregistré', false);
    } catch (err) {
      showFlash(matchId, err.message, true);
    } finally {
      setSaving((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const showFlash = (matchId, text, isError) => {
    setFlash((prev) => ({ ...prev, [matchId]: { text, isError } }));
    setTimeout(() => setFlash((prev) => ({ ...prev, [matchId]: null })), 3000);
  };

  const groups = [...new Set(matches.map((m) => m.group_letter).filter(Boolean))].sort();
  const visibleMatches = matches.filter((m) => {
    if (groupFilter && m.group_letter !== groupFilter) return false;
    if (statusFilter === 'scheduled' && m.status !== 'scheduled') return false;
    if (statusFilter === 'finished'  && m.status !== 'finished')  return false;
    return true;
  });
  const grouped = visibleMatches.reduce((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = [];
    acc[m.stage].push(m);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      {/* Titre */}
      <div className="mb-6">
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>Matchs &amp; Pronostics</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Entrez vos scores avant le coup d'envoi.
        </p>
      </div>

      {/* Filtres */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[['all','Tous'], ['scheduled','À venir'], ['finished','Terminés']].map(([val, label]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`pill${statusFilter === val ? ' active' : ''}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-xs font-semibold mr-1" style={{ color: 'var(--text-muted)' }}>Groupe :</span>
          <button onClick={() => setGroupFilter(null)} className={`pill${groupFilter === null ? ' active' : ''}`}>Tous</button>
          {groups.map((g) => (
            <button key={g} onClick={() => setGroupFilter(g === groupFilter ? null : g)}
              className={`pill${groupFilter === g ? ' active' : ''}`}>{g}</button>
          ))}
        </div>
      </div>

      {/* Matchs par stage */}
      {STAGE_ORDER.filter((s) => grouped[s]).map((stage) => (
        <div key={stage} className="mb-8">
          <h3 className="text-xs font-black uppercase tracking-widest mb-3 pb-2 border-b"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            {STAGE_LABEL[stage] || stage}
          </h3>

          <div className="space-y-2">
            {grouped[stage].map((match) => {
              const pred = predictions[match.id];
              const bot  = botPredictions[match.id];
              const inp  = inputs[match.id] || { home: '', away: '' };
              const msg  = flash[match.id];
              const st   = STATUS_STYLE[match.status] || STATUS_STYLE.scheduled;
              const isScheduled = match.status === 'scheduled';

              return (
                <div key={match.id} className="card overflow-hidden">
                  <div className="p-4 flex flex-wrap sm:flex-nowrap items-center gap-3">

                    {/* Statut */}
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 w-20 text-center"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {STATUS_LABEL[match.status]}
                    </span>

                    {/* Équipes + score */}
                    <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
                      <span className="font-semibold text-right truncate w-28" style={{ color: 'var(--text)' }}>
                        {match.home_team}
                      </span>

                      {match.status === 'finished' ? (
                        <span className="text-xl font-black shrink-0 w-14 text-center" style={{ color: 'var(--accent)' }}>
                          {match.home_score}–{match.away_score}
                        </span>
                      ) : (
                        <span className="shrink-0 w-14 text-center text-sm" style={{ color: 'var(--text-muted)' }}>vs</span>
                      )}

                      <span className="font-semibold text-left truncate w-28" style={{ color: 'var(--text)' }}>
                        {match.away_team}
                      </span>
                    </div>

                    {/* Date */}
                    <span className="text-xs shrink-0 hidden lg:block w-28 text-right" style={{ color: 'var(--text-muted)' }}>
                      {new Date(match.match_datetime).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>

                    {/* Zone pronostic */}
                    {isScheduled ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <input type="number" min="0" max="99"
                          className="score-box" value={inp.home}
                          onChange={(e) => handleInput(match.id, 'home', e.target.value)}
                          placeholder="–" />
                        <span className="font-black text-sm" style={{ color: 'var(--text-muted)' }}>:</span>
                        <input type="number" min="0" max="99"
                          className="score-box" value={inp.away}
                          onChange={(e) => handleInput(match.id, 'away', e.target.value)}
                          placeholder="–" />
                        <button
                          onClick={() => handleSave(match.id)}
                          disabled={saving[match.id] || inp.home === '' || inp.away === ''}
                          className="btn btn-primary text-sm px-3 py-1.5">
                          {saving[match.id] ? '…' : pred ? 'Modifier' : 'Valider'}
                        </button>
                        {msg && (
                          <span className={`text-xs ${msg.isError ? 'text-red-400' : 'text-green-400'}`}>
                            {msg.text}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="shrink-0 w-40 text-center">
                        {pred ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${badgeClass(pred.points_awarded)}`}>
                            {pred.pred_home}–{pred.pred_away}
                            {pred.points_awarded != null && (
                              <span className="opacity-80">· {pred.points_awarded}pt</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Non pronostiqué</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prédiction bot */}
                  {bot && isScheduled && (
                    <div className="px-4 py-2.5 flex items-center gap-3 text-xs border-t"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                      <span className="font-bold" style={{ color: '#a78bfa' }}>🤖 Bot IA</span>
                      <span className="font-black" style={{ color: 'var(--accent)' }}>
                        {bot.pred_home}–{bot.pred_away}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Dom. <span className="text-green-400 font-semibold">{Math.round(bot.prob_home_win * 100)}%</span>
                        {' · '}Nul <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{Math.round(bot.prob_draw * 100)}%</span>
                        {' · '}Ext. <span className="text-red-400 font-semibold">{Math.round(bot.prob_away_win * 100)}%</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {visibleMatches.length === 0 && (
        <div className="text-center py-20">
          <p style={{ color: 'var(--text-muted)' }}>
            {matches.length === 0 ? 'Aucun match disponible.' : 'Aucun match pour ces filtres.'}
          </p>
        </div>
      )}
    </div>
  );
}
