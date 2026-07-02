import { useState, useEffect } from 'react';
import { API } from '../config.js';
import { useLang } from '../LanguageContext.jsx';
import { flagUrl } from '../flags.js';
import { teamName as getTeamName } from '../teamNames.js';

/* ── dimensions ── */
const CARD_H   = 60;   // match card height (px)
const CARD_W   = 172;  // match card width
const ARM_W    = 26;   // trailing arm (connector going right)
const LEAD_W   = 20;   // leading stub (connector coming from left)
const BASE_SLOT = 84;  // slot height at the widest round

const STAGES = [
  { key: 'round32', labelKey: 'bracket.round32' },
  { key: 'round16', labelKey: 'bracket.round16' },
  { key: 'quarter', labelKey: 'bracket.quarter'  },
  { key: 'semi',    labelKey: 'bracket.semi'     },
  { key: 'final',   labelKey: 'bracket.final'    },
];

/* ── single team row inside a match card ── */
function TeamRow({ name, code, score, winner, penWinner }) {
  const flag = code ? flagUrl(code) : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '0 8px', height: CARD_H / 2,
      background: winner ? 'rgba(34,197,94,0.1)' : 'transparent',
    }}>
      {flag
        ? <img src={flag} width={16} height={12}
            style={{ objectFit: 'cover', borderRadius: 2, flexShrink: 0,
              border: '1px solid rgba(0,0,0,0.12)' }} />
        : <div style={{ width: 16, height: 12, borderRadius: 2, flexShrink: 0,
            background: 'var(--bg-input)', border: '1px solid var(--border)' }} />
      }
      <span style={{
        flex: 1, fontSize: 11.5, lineHeight: 1.2,
        fontWeight: winner ? 700 : name ? 500 : 400,
        color: name ? 'var(--text)' : 'var(--text-muted)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {name ?? '—'}
      </span>
      {score != null && (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 900, minWidth: 16, textAlign: 'right',
            color: winner ? '#22c55e' : 'var(--accent)',
          }}>
            {score}
          </span>
          {penWinner && (
            <span style={{ fontSize: 8, fontWeight: 700, color: '#22c55e', opacity: 0.85 }}>
              pen.
            </span>
          )}
        </span>
      )}
    </div>
  );
}

/* ── one match card ── */
function MatchCard({ match, lang, tbd }) {
  const finished   = match?.status === 'finished';
  const penWinner  = match?.penalty_winner_code ?? null;

  // Vainqueur = meilleur score OU vainqueur aux tirs au but si égalité
  const homeWin = finished && (
    match.home_score > match.away_score ||
    (penWinner && penWinner === match.home_team_code)
  );
  const awayWin = finished && (
    match.away_score > match.home_score ||
    (penWinner && penWinner === match.away_team_code)
  );

  return (
    <div style={{
      width: CARD_W, height: CARD_H, flexShrink: 0,
      border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
      background: 'var(--bg-card)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      opacity: match ? 1 : 0.45,
    }}>
      <TeamRow
        name={match ? getTeamName(match.home_team, lang) : tbd}
        code={match?.home_team_code ?? null}
        score={finished ? match.home_score : null}
        winner={homeWin}
        penWinner={homeWin && !!penWinner}
      />
      <div style={{ height: 1, background: 'var(--border)' }} />
      <TeamRow
        name={match ? getTeamName(match.away_team, lang) : tbd}
        code={match?.away_team_code ?? null}
        score={finished ? match.away_score : null}
        winner={awayWin}
        penWinner={awayWin && !!penWinner}
      />
    </div>
  );
}

/* ── one match slot (card + optional connectors) ──
 *
 * Bracket line technique:
 *   • Leading stub  : horizontal line entering from the LEFT (all rounds except first)
 *   • Trailing arm  : L-shaped connector on the RIGHT leading to next round
 *       TOP  match arm → aligns to flex-end  → border-top  + border-right  (┐)
 *       BOT  match arm → aligns to flex-start → border-bottom + border-right (┘)
 *   Together the two arms form a  ┤  that meets at the pair boundary.
 */
function MatchSlot({ match, slotH, isFirstCol, isLastCol, isTopOfPair, lang, tbd }) {
  const LINE = '1.5px solid var(--border)';
  return (
    <div style={{ height: slotH, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>

      {/* leading stub */}
      {!isFirstCol && (
        <div style={{ width: LEAD_W, height: 0, borderTop: LINE, flexShrink: 0 }} />
      )}

      {/* match card */}
      <MatchCard match={match} lang={lang} tbd={tbd} />

      {/* trailing arm */}
      {!isLastCol && (
        <div style={{
          width: ARM_W, flexShrink: 0,
          height: slotH / 2,
          alignSelf: isTopOfPair ? 'flex-end' : 'flex-start',
          borderTop:    isTopOfPair ? LINE : 'none',
          borderBottom: isTopOfPair ? 'none' : LINE,
          borderRight: LINE,
        }} />
      )}
    </div>
  );
}

/* ── main component ── */
export default function KnockoutBracket() {
  const { t, lang } = useLang();
  const [matchesByStage, setMatchesByStage] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      STAGES.map(({ key }) =>
        fetch(`${API}/api/matches?stage=${key}`)
          .then(r => r.json())
          .then(d => ({
            key,
            matches: (d.matches || []).sort(
              (a, b) => new Date(a.match_datetime) - new Date(b.match_datetime)
            ),
          }))
          .catch(() => ({ key, matches: [] }))
      )
    )
      .then(results => {
        const map = {};
        results.forEach(({ key, matches }) => { if (matches.length > 0) map[key] = matches; });
        setMatchesByStage(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeStages = STAGES.filter(s => matchesByStage[s.key]?.length > 0);

  return (
    <section>
      <h3 className="text-xs font-black uppercase tracking-widest mb-4 pb-2 border-b"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        {t('bracket.title')}
      </h3>

      {loading && (
        <p className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
          {t('common.loading')}
        </p>
      )}

      {!loading && activeStages.length === 0 && (
        <p className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
          {t('bracket.empty')}
        </p>
      )}

      {!loading && activeStages.length > 0 && (() => {
        const baseCount = matchesByStage[activeStages[0].key].length;
        const tbd = t('bracket.tbd');

        /* column widths for the label row */
        const colWidth = (colIdx) => {
          const isFirst = colIdx === 0;
          const isLast  = colIdx === activeStages.length - 1;
          return (isFirst ? 0 : LEAD_W) + CARD_W + (isLast ? 0 : ARM_W);
        };

        return (
          <div style={{ overflowX: 'auto', paddingBottom: 16 }}>

            {/* ── round labels ── */}
            <div style={{ display: 'flex', marginBottom: 10 }}>
              {activeStages.map((s, ci) => (
                <div key={s.key} style={{
                  width: colWidth(ci), textAlign: 'center', flexShrink: 0,
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '.07em', color: 'var(--text-muted)',
                }}>
                  {t(s.labelKey)}
                </div>
              ))}
            </div>

            {/* ── bracket columns ── */}
            <div style={{ display: 'flex' }}>
              {activeStages.map((s, ci) => {
                const matches  = matchesByStage[s.key];
                const slotH    = BASE_SLOT * (baseCount / matches.length);
                const isFirst  = ci === 0;
                const isLast   = ci === activeStages.length - 1;

                return (
                  <div key={s.key} style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    {matches.map((match, i) => (
                      <MatchSlot
                        key={match.id}
                        match={match}
                        slotH={slotH}
                        isFirstCol={isFirst}
                        isLastCol={isLast}
                        isTopOfPair={i % 2 === 0}
                        lang={lang}
                        tbd={tbd}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </section>
  );
}
