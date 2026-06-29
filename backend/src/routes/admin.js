const express = require('express');
const authenticate = require('../middleware/auth');
const { runScrape } = require('../scraper');
const pool = require('../db');

const router = express.Router();

// Ratings relatifs des équipes (Elo simplifié)
const RATINGS = {
  'Brésil': 1800, 'France': 1780, 'Angleterre': 1750, 'Allemagne': 1720,
  'Espagne': 1700, 'Argentine': 1760, 'Portugal': 1690, 'Pays-Bas': 1660,
  'Belgique': 1640, 'Italie': 1620, 'USA': 1560, 'Mexique': 1540,
  'Maroc': 1520, 'Japon': 1510, 'Sénégal': 1500, 'Australie': 1490,
  'Croatie': 1530, 'Suisse': 1520, 'Uruguay': 1540, 'Colombie': 1530,
  'Norvège': 1560, 'Suède': 1510, 'Danemark': 1530, 'Pologne': 1490,
  'Paraguay': 1420, "Côte d'Ivoire": 1510, 'Cameroun': 1430, 'Équateur': 1460,
  'Chili': 1480, 'Iran': 1420, 'Tunisie': 1410, 'Ghana': 1420,
  'Serbie': 1490, 'Tchéquie': 1470, 'Autriche': 1480, 'Turquie': 1490,
  'Canada': 1480, 'Corée du Sud': 1480, 'Qatar': 1380, 'Arabie Saoudite': 1400,
  'Costa Rica': 1440, 'Panama': 1420, 'Pérou': 1440, 'Venezuela': 1390,
};
const DEFAULT_RATING = 1450;

function estimateProbs(homeTeam, awayTeam) {
  const hr = RATINGS[homeTeam] || DEFAULT_RATING;
  const ar = RATINGS[awayTeam] || DEFAULT_RATING;
  const diff = hr + 30 - ar; // +30 = avantage terrain
  const draw = 0.22;
  const pHome = (1 / (1 + Math.pow(10, -diff / 400))) * (1 - draw);
  const pAway = (1 - pHome / (1 - draw)) * (1 - draw);
  return {
    prob_home_win: Math.round(pHome * 10000) / 10000,
    prob_draw:     Math.round(draw  * 10000) / 10000,
    prob_away_win: Math.round(Math.max(0, 1 - pHome - draw) * 10000) / 10000,
  };
}

function predictScore(probs) {
  if (probs.prob_home_win > 0.55) return { pred_home: 2, pred_away: 0 };
  if (probs.prob_away_win > 0.55) return { pred_home: 0, pred_away: 2 };
  return { pred_home: 1, pred_away: 1 };
}

// État en mémoire du scraping en cours
let _status = { running: false, last: null };

function triggerScrape() {
    if (_status.running) return false;
    _status.running = true;

    runScrape()
        .then((stats) => {
            _status.last = { success: true, trigger: 'manuel', at: new Date().toISOString(), stats };
        })
        .catch((err) => {
            console.error('Scraping échoué :', err.message);
            _status.last = { success: false, trigger: 'manuel', error: err.message, at: new Date().toISOString() };
        })
        .finally(() => { _status.running = false; });

    return true;
}

// POST /api/admin/scrape — déclenche un import (admin uniquement)
router.post('/scrape', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Réservé aux administrateurs' });
    }
    if (!triggerScrape()) {
        return res.status(409).json({ error: 'Scraping déjà en cours' });
    }
    res.status(202).json({ message: 'Scraping démarré' });
});

// POST /api/admin/generate-bot-predictions — génère les prédictions Botnaru manquantes
router.post('/generate-bot-predictions', authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Réservé aux administrateurs' });
    }
    try {
        const { rows: matches } = await pool.query(`
            SELECT m.id, ht.name AS home_team, at.name AS away_team
            FROM matches m
            JOIN teams ht ON ht.id = m.home_team_id
            JOIN teams at ON at.id = m.away_team_id
            WHERE m.status = 'scheduled'
              AND NOT EXISTS (SELECT 1 FROM bot_predictions bp WHERE bp.match_id = m.id)
            ORDER BY m.match_datetime ASC
        `);

        if (matches.length === 0) {
            return res.json({ message: 'Tous les matchs scheduled ont déjà une prédiction.', inserted: 0 });
        }

        const inserted = [];
        for (const m of matches) {
            const probs = estimateProbs(m.home_team, m.away_team);
            const score = predictScore(probs);
            await pool.query(`
                INSERT INTO bot_predictions
                  (match_id, pred_home, pred_away, prob_home_win, prob_draw, prob_away_win)
                VALUES ($1,$2,$3,$4,$5,$6)
                ON CONFLICT (match_id) DO NOTHING
            `, [m.id, score.pred_home, score.pred_away,
                probs.prob_home_win, probs.prob_draw, probs.prob_away_win]);
            inserted.push({
                match: `${m.home_team} vs ${m.away_team}`,
                score: `${score.pred_home}-${score.pred_away}`,
                probs: `${Math.round(probs.prob_home_win*100)}% / ${Math.round(probs.prob_draw*100)}% / ${Math.round(probs.prob_away_win*100)}%`,
            });
        }

        res.json({ message: `${inserted.length} prédiction(s) générée(s).`, inserted });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/scrape/status — état du dernier scraping (admin uniquement)
router.get('/scrape/status', authenticate, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Réservé aux administrateurs' });
    }
    res.json(_status);
});

module.exports = router;
