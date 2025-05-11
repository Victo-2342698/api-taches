const pool = require('../config/db_pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.recupererOuGenererCle = async (req, res) => {
  console.log('Requête reçue:', req.body);
  const { courriel, password, regenerer } = req.body;

  if (!courriel || !password) {
    return res.status(400).json({ erreur: 'Courriel et mot de passe requis.' });
  }

  try {
    const result = await pool.query('SELECT * FROM utilisateurs WHERE courriel = $1', [courriel]);

    const utilisateur = result.rows[0];
    if (!utilisateur) {
      return res.status(404).json({ erreur: 'Utilisateur introuvable.' });
    }


    const match = await bcrypt.compare(password, utilisateur.mot_de_passe_hash);
    if (!match) {
      return res.status(401).json({ erreur: 'Mot de passe incorrect.' });
    }

    if (regenerer === true || regenerer === 'true') {
      const nouvelleCle = uuidv4();
      await pool.query('UPDATE utilisateurs SET cle_api = $1 WHERE id = $2', [nouvelleCle, utilisateur.id]);
      return res.json({ message: 'Clé régénérée.', cle_api: nouvelleCle });
    }

    return res.json({ message: 'Clé existante.', cle_api: utilisateur.cle_api });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};
