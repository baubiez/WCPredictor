const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id   AS user_id,
                u.username,
                COALESCE(SUM(p.points_awarded), 0)                                    AS total_points,
                COUNT(p.points_awarded)                                                AS matchs_joues,
                COUNT(CASE WHEN p.points_awarded >= 1 THEN 1 END)                     AS bon_prono,
                COUNT(CASE WHEN p.points_awarded = 3  THEN 1 END)                     AS score_exact,
                CASE
                    WHEN COUNT(p.points_awarded) = 0 THEN 0
                    ELSE ROUND(
                        COUNT(CASE WHEN p.points_awarded >= 1 THEN 1 END) * 100.0
                        / COUNT(p.points_awarded), 1
                    )
                END AS precision_pct
            FROM users u
            LEFT JOIN predictions p ON p.user_id = u.id
            GROUP BY u.id, u.username
            ORDER BY total_points DESC
        `);
        res.json({ leaderboard: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
