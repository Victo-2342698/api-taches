const pool = require('../config/db_pg');

const verifierCleAPI = async (req, res, next) => {
  const cle = req.headers['authorization'];

  if (!cle) {
    return res.status(401).json({ erreur: 'Clé API manquante.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM utilisateurs WHERE cle_api = ?', [cle]);

    if (rows.length === 0) {
      return res.status(403).json({ erreur: 'Clé API invalide.' });
    }

    req.utilisateur = rows[0];
    next();

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};

module.exports = verifierCleAPI;
