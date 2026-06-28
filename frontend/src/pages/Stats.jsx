import { useState, useEffect } from 'react';
import { API } from '../config.js';

export default function Stats() {
  const [scorers, setScorers] = useState([]);
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/stats/scorers`).then((r) => r.json()),
      fetch(`${API}/api/stats/standings`).then((r) => r.json()),
    ])
      .then(([sd, st]) => {
        setScorers(sd.scorers || []);
        const grouped = (st.standings || []).reduce((acc, t) => {
          const g = t.group_letter || '?';
          if (!acc[g]) acc[g] = [];
          acc[g].push(t);
          return acc;
        }, {});
        setStandings(grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center mt-20" style={{ color: 'var(--text-muted)' }}>Chargement…</p>;
  }

  const groups = Object.keys(standings).sort();

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h2 className="text-3xl font-black" style={{ color: 'var(--text)' }}>Statistiques</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Classements et buteurs de la compétition</p>
      </div>

      {/* Classements */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          Classements par groupe
        </h3>

        {groups.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            Disponible dès que des matchs seront terminés.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((g) => (
              <div key={g} className="card overflow-hidden">
                <div className="px-4 py-2.5 font-bold text-sm border-b"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--accent)' }}>
                  Groupe {g}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase border-b"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      <th className="px-4 py-2 text-left">Équipe</th>
                      <th className="px-3 py-2 text-center">J</th>
                      <th className="px-3 py-2 text-center">Pts</th>
                      <th className="px-3 py-2 text-center hidden sm:table-cell">BP</th>
                      <th className="px-3 py-2 text-center hidden sm:table-cell">BC</th>
                      <th className="px-3 py-2 text-center">Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings[g].map((team, i) => (
                      <tr key={team.code} className="border-b transition-colors duration-100"
                        style={{ borderColor: 'var(--border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-2.5 font-medium flex items-center gap-2" style={{ color: i < 2 ? 'var(--text)' : 'var(--text-muted)' }}>
                          {i < 2 && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                          {team.team}
                          <span className="text-xs opacity-50">{team.code}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center" style={{ color: 'var(--text-muted)' }}>{team.played}</td>
                        <td className="px-3 py-2.5 text-center font-black" style={{ color: 'var(--accent)' }}>{team.points}</td>
                        <td className="px-3 py-2.5 text-center hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{team.goals_for}</td>
                        <td className="px-3 py-2.5 text-center hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{team.goals_against}</td>
                        <td className="px-3 py-2.5 text-center font-semibold" style={{ color: team.goal_diff >= 0 ? '#22c55e' : '#ef4444' }}>
                          {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Buteurs */}
      <section>
        <h3 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          Top buteurs
        </h3>

        {scorers.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Aucune statistique disponible.</p>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase border-b"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-input)' }}>
                  <th className="px-4 py-3 text-center w-12">#</th>
                  <th className="px-4 py-3 text-left">Joueur</th>
                  <th className="px-4 py-3 text-left">Équipe</th>
                  <th className="px-4 py-3 text-center">Buts</th>
                  <th className="px-4 py-3 text-center hidden sm:table-cell">Passes</th>
                </tr>
              </thead>
              <tbody>
                {scorers.map((s, i) => (
                  <tr key={`${s.player}-${s.code}`} className="border-b transition-colors duration-100"
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text)' }}>{s.player}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {s.team} <span className="opacity-50 text-xs">{s.code}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-black text-lg" style={{ color: 'var(--accent)' }}>{s.goals}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{s.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
