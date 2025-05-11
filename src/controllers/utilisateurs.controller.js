const pool = require('../config/db_pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.ajouterUtilisateur = async (req, res) => {
  const { nom, prenom, courriel, password } = req.body;

  if (!nom || !prenom || !courriel || !password) {
    return res.status(400).json({ erreur: 'Champs manquants.' });
  }

  console.log('Données reçues :', req.body);

  try {
    const existResult = await pool.query('SELECT * FROM utilisateurs WHERE courriel = $1', [courriel]);
    if (existResult.rows.length > 0) {
      return res.status(409).json({ erreur: 'Courriel déjà utilisé.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const cle_api = uuidv4();

    const insertResult = await pool.query(
      'INSERT INTO utilisateurs (nom, prenom, courriel, mot_de_passe_hash, cle_api) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nom, prenom, courriel, hash, cle_api]
    );

    res.status(201).json({
      message: 'Utilisateur ajouté',
      id: insertResult.rows[0].id,
      cle_api: cle_api
    });
  } catch (err) {
    console.error("Erreur SQL :", err.message);
    res.status(500).json({ erreur: 'Erreur serveur' });
  }
};
