const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const pool = require('../db');
const authenticate = require('../middleware/auth');
const { handle } = require('../middleware/validate');

const router = express.Router();

const profileRules = [
    body('current_password')
        .notEmpty().withMessage('Mot de passe actuel requis')
        .isLength({ max: 128 }).withMessage('Mot de passe trop long'),

    body('new_email')
        .optional({ checkFalsy: true })
        .trim().normalizeEmail()
        .isEmail().withMessage('Adresse email invalide')
        .isLength({ max: 254 }).withMessage('Email trop long'),

    body('new_password')
        .optional({ checkFalsy: true })
        .isLength({ min: 8, max: 128 }).withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
        .matches(/[A-Z]/).withMessage('Au moins une majuscule requise')
        .matches(/[a-z]/).withMessage('Au moins une minuscule requise')
        .matches(/[0-9]/).withMessage('Au moins un chiffre requis'),
];

router.put('/profile', authenticate, profileRules, handle, async (req, res) => {
    const { current_password, new_email, new_password } = req.body;
    const userId = req.user.id;

    if (!new_email && !new_password) {
        return res.status(400).json({ error: 'Aucune modification fournie' });
    }

    try {
        const result = await pool.query(
            'SELECT password_hash, email FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

        const valid = await bcrypt.compare(current_password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

        if (new_email && new_email === user.email) {
            return res.status(400).json({ error: "C'est déjà votre adresse email actuelle" });
        }

        const cols = [];
        const vals = [];
        let i = 1;

        if (new_email) {
            cols.push(`email = $${i++}`);
            vals.push(new_email);
        }
        if (new_password) {
            const hash = await bcrypt.hash(new_password, 12);
            cols.push(`password_hash = $${i++}`);
            vals.push(hash);
        }

        vals.push(userId);
        await pool.query(
            `UPDATE users SET ${cols.join(', ')} WHERE id = $${i}`,
            vals
        );

        res.json({ message: 'Profil mis à jour avec succès' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Cette adresse email est déjà utilisée' });
        }
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
