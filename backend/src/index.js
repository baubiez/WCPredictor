require('dotenv').config();

// Validation des variables critiques au démarrage
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET doit faire au moins 32 caractères.');
    process.exit(1);
}
if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL manquant.');
    process.exit(1);
}

const pool = require('./db');
const app  = require('./app');
const PORT = process.env.PORT || 3000;

async function runMigrations() {
    // Idempotent : IF NOT EXISTS garantit qu'aucune erreur n'est levée si la colonne existe déjà
    await pool.query(`
        ALTER TABLE matches
        ADD COLUMN IF NOT EXISTS penalty_winner_id INT REFERENCES teams(id)
    `);
    console.log('Migration 004 : penalty_winner_id OK');
}

runMigrations()
    .then(() => {
        app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('Échec des migrations au démarrage :', err.message);
        process.exit(1);
    });
