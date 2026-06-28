/**
 * Scraper WCPredictor — port Node.js du scraper Python
 * Source : https://raw.githubusercontent.com/upbound-web/worldcup-live.json/master/2026/worldcup.json
 */

const pool = require('./db');

const JSON_URL =
    'https://raw.githubusercontent.com/upbound-web/worldcup-live.json/master/2026/worldcup.json';

const TEAM_CODES = {
    'France':'FRA','Brazil':'BRA','Argentina':'ARG','Spain':'ESP','Germany':'GER',
    'England':'ENG','Portugal':'POR','Belgium':'BEL','Netherlands':'NED','Italy':'ITA',
    'Croatia':'CRO','Serbia':'SRB','Switzerland':'SUI','Denmark':'DEN','Sweden':'SWE',
    'Norway':'NOR','Poland':'POL','Ukraine':'UKR','Austria':'AUT','Czech Republic':'CZE',
    'Slovakia':'SVK','Hungary':'HUN','Romania':'ROU','Greece':'GRE','Turkey':'TUR',
    'Scotland':'SCO','Wales':'WAL','Ireland':'IRL','Morocco':'MAR','Senegal':'SEN',
    'Tunisia':'TUN','Egypt':'EGY','Cameroon':'CMR','Ghana':'GHA','Nigeria':'NGA',
    'Algeria':'ALG','Ivory Coast':'CIV','Mali':'MLI','South Africa':'RSA','Kenya':'KEN',
    'DR Congo':'COD','Congo DR':'COD','Togo':'TOG','Namibia':'NAM','USA':'USA',
    'Mexico':'MEX','Canada':'CAN','Honduras':'HON','Costa Rica':'CRC','Panama':'PAN',
    'Haiti':'HAI','Jamaica':'JAM','Guatemala':'GUA','El Salvador':'SLV','Cuba':'CUB',
    'Uruguay':'URU','Colombia':'COL','Ecuador':'ECU','Peru':'PER','Chile':'CHI',
    'Bolivia':'BOL','Paraguay':'PAR','Venezuela':'VEN','Japan':'JPN',
    'South Korea':'KOR','Iran':'IRN','Saudi Arabia':'KSA','Australia':'AUS',
    'New Zealand':'NZL','Indonesia':'IDN','Philippines':'PHI','Thailand':'THA',
    'Vietnam':'VIE','Qatar':'QAT','UAE':'UAE','Bahrain':'BHR','Kuwait':'KUW',
    'Jordan':'JOR','Iraq':'IRQ','Yemen':'YEM','China':'CHN','India':'IND',
    'Uzbekistan':'UZB',
};

const STAGE_MAP = {
    'group':'group','round of 32':'round32','round of 16':'round16',
    'quarter':'quarter','semi':'semi','third':'semi','final':'final',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function teamCode(name) {
    if (TEAM_CODES[name]) return TEAM_CODES[name];
    const words = name.toUpperCase().split(' ');
    return words.length === 1 ? words[0].slice(0, 3) : words.map(w => w[0]).join('').slice(0, 3);
}

function parseStage(roundStr = '') {
    const rl = roundStr.toLowerCase();
    for (const [key, val] of Object.entries(STAGE_MAP)) {
        if (rl.includes(key)) return val;
    }
    return 'group';
}

function parseDatetimeUtc(dateStr, timeStr = '') {
    const m = (timeStr || '').match(/(\d{2}):(\d{2})\s*UTC([+-]\d+)?/);
    const hour     = m ? parseInt(m[1]) : 0;
    const minute   = m ? parseInt(m[2]) : 0;
    const offsetH  = m && m[3] ? parseInt(m[3]) : 0;
    const [y, mo, d] = dateStr.split('-').map(Number);
    const utcMs = Date.UTC(y, mo - 1, d, hour - offsetH, minute);
    return new Date(utcMs).toISOString();
}

function parseGroup(groupStr = '') {
    const m = groupStr.trim().match(/([A-La-l])$/);
    return m ? m[1].toUpperCase() : null;
}

function isPlaceholder(name = '') {
    if (!name) return true;
    if (/^[0-9WL]\w*$/.test(name)) return true;
    if (/\b(winner|runner|loser|group)\b/i.test(name)) return true;
    return false;
}

// ── Extraction ───────────────────────────────────────────────────────────────

function extractTeams(matches) {
    const teams = {};
    for (const m of matches) {
        for (const key of ['team1', 'team2']) {
            const name = m[key] || '';
            if (name && !isPlaceholder(name) && !teams[name]) {
                teams[name] = { code: teamCode(name), group: parseGroup(m.group || '') };
            }
        }
    }
    return teams;
}

function extractMatches(rawMatches, teamIdMap) {
    const result = [];
    for (const m of rawMatches) {
        const t1 = m.team1 || '', t2 = m.team2 || '';
        if (isPlaceholder(t1) || isPlaceholder(t2)) continue;
        if (!teamIdMap[t1] || !teamIdMap[t2]) continue;

        const ft = m.score?.ft;
        result.push({
            home_team_id:   teamIdMap[t1],
            away_team_id:   teamIdMap[t2],
            match_datetime: parseDatetimeUtc(m.date || '2026-01-01', m.time || ''),
            stage:          parseStage(m.round || ''),
            group_letter:   parseGroup(m.group || ''),
            stadium:        m.ground || '',
            status:         ft ? 'finished' : 'scheduled',
            home_score:     ft ? ft[0] : null,
            away_score:     ft ? ft[1] : null,
        });
    }
    return result;
}

function extractGoals(rawMatches) {
    const players = {};
    for (const m of rawMatches) {
        for (const [side, goalsKey] of [['team1','goals1'],['team2','goals2']]) {
            const teamName = m[side] || '';
            for (const g of m[goalsKey] || []) {
                const name = (g.name || '').trim();
                if (!name || g.owngoal) continue;
                if (!players[name]) players[name] = { goals: 0, team: teamName };
                players[name].goals += 1;
            }
        }
    }
    return players;
}

// ── Écriture en base ──────────────────────────────────────────────────────────

async function insertTeams(teams) {
    const teamIdMap = {};
    for (const [name, info] of Object.entries(teams)) {
        const { rows } = await pool.query(
            `INSERT INTO teams (name, code, group_letter)
             VALUES ($1, $2, $3)
             ON CONFLICT (code) DO UPDATE
                 SET name = EXCLUDED.name, group_letter = EXCLUDED.group_letter
             RETURNING id`,
            [name, info.code, info.group],
        );
        teamIdMap[name] = rows[0].id;
    }
    return teamIdMap;
}

async function insertMatches(matches) {
    for (const m of matches) {
        await pool.query(
            `INSERT INTO matches
                 (home_team_id, away_team_id, match_datetime,
                  stage, group_letter, stadium, status, home_score, away_score)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (home_team_id, away_team_id) DO UPDATE SET
                 match_datetime = EXCLUDED.match_datetime,
                 stage          = EXCLUDED.stage,
                 group_letter   = EXCLUDED.group_letter,
                 stadium        = EXCLUDED.stadium,
                 status = CASE
                     WHEN EXCLUDED.status = 'finished' THEN 'finished'::match_status
                     WHEN matches.status  = 'finished' THEN 'finished'::match_status
                     ELSE EXCLUDED.status
                 END,
                 home_score = COALESCE(EXCLUDED.home_score, matches.home_score),
                 away_score = COALESCE(EXCLUDED.away_score, matches.away_score)`,
            [m.home_team_id, m.away_team_id, m.match_datetime,
             m.stage, m.group_letter, m.stadium, m.status,
             m.home_score, m.away_score],
        );
    }
}

async function scorePredictions() {
    await pool.query(`
        UPDATE predictions p
        SET points_awarded = CASE
            WHEN p.pred_home = m.home_score AND p.pred_away = m.away_score THEN 3
            WHEN sign(p.pred_home - p.pred_away) = sign(m.home_score - m.away_score) THEN 1
            ELSE 0
        END
        FROM matches m
        WHERE p.match_id = m.id
          AND m.status = 'finished'
          AND m.home_score IS NOT NULL
          AND m.away_score IS NOT NULL
    `);
}

async function insertScorers(playersData, teamIdMap) {
    for (const [playerName, info] of Object.entries(playersData)) {
        const teamId = teamIdMap[info.team] || null;
        const { rows } = await pool.query(
            `SELECT id FROM players WHERE name = $1 AND team_id IS NOT DISTINCT FROM $2`,
            [playerName, teamId],
        );
        let playerId;
        if (rows.length > 0) {
            playerId = rows[0].id;
        } else {
            const ins = await pool.query(
                `INSERT INTO players (name, team_id, position) VALUES ($1, $2, 'FW') RETURNING id`,
                [playerName, teamId],
            );
            playerId = ins.rows[0].id;
        }
        await pool.query(
            `INSERT INTO player_stats (player_id, goals, assists, minutes)
             VALUES ($1, $2, 0, 0)
             ON CONFLICT (player_id) DO UPDATE
                 SET goals = EXCLUDED.goals, updated_at = now()`,
            [playerId, info.goals],
        );
    }
}

// ── Point d'entrée ────────────────────────────────────────────────────────────

async function runScrape() {
    const res  = await fetch(JSON_URL, { headers: { 'User-Agent': 'WCPredictor-scraper/2.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} lors du fetch JSON`);
    const data = await res.json();
    const rawMatches = data.matches || [];

    const teams     = extractTeams(rawMatches);
    const teamIdMap = await insertTeams(teams);

    const matches = extractMatches(rawMatches, teamIdMap);
    await insertMatches(matches);
    await scorePredictions();

    const playersData = extractGoals(rawMatches);
    await insertScorers(playersData, teamIdMap);

    return {
        teams:   Object.keys(teams).length,
        matches: matches.length,
        players: Object.keys(playersData).length,
    };
}

module.exports = { runScrape };
