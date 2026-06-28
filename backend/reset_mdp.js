const bcrypt = require('bcryptjs'); // Remplace par 'bcryptjs' si besoin
const { Client } = require('pg');

const updatePassword = async () => {
  // --- À REMPLIR AVEC TES INFOS ---
  const username = "Megazord"; // <-- Indique son nom d'utilisateur ici
  const plainPassword = "TheGame#2026"; // N'oublie pas le chiffre !
  const dbUrl = "postgresql://wcpredictor_ai_user:vcXwakZUhmai9RvsM2dSuiO3TgKdWiPz@dpg-d90fks0k1i2s73fkr4vg-a.frankfurt-postgres.render.com/wcpredictor_ai"; // Ton URL Render
  // --------------------------------

  try {
    console.log("Génération du hash en cours...");
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    
    console.log("Connexion à la base de données Render...");
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();

    console.log("Mise à jour de l'utilisateur...");
    // La modification est ici : on cherche dans la colonne "username"
    const res = await client.query(
      "UPDATE users SET password_hash = $1 WHERE username = $2",
      [passwordHash, username]
    );

    if (res.rowCount > 0) {
      console.log("✅ Succès ! Le mot de passe a été mis à jour.");
    } else {
      console.log("❌ Erreur : Aucun utilisateur trouvé avec ce nom d'utilisateur.");
    }

    await client.end();
  } catch (err) {
    console.error("Une erreur est survenue :", err);
  }
};

updatePassword();