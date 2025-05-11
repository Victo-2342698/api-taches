const pool = require('../config/db_pg');

exports.ajouterTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const { titre, description, date_debut, date_echeance } = req.body;

  if (!titre || !date_debut || !date_echeance) {
    return res.status(400).json({ erreur: 'Champs obligatoires manquants.' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO taches (utilisateur_id, titre, description, date_debut, date_echeance)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [utilisateurId, titre, description || null, date_debut, date_echeance]);

    res.status(201).json({
      message: 'Tâche ajoutée avec succès.',
      tache_id: result.rows[0].id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
};

exports.listerTaches = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const afficherToutes = req.query.toutes === 'true';

  try {
    const sql = afficherToutes
      ? 'SELECT * FROM taches WHERE utilisateur_id = $1'
      : `SELECT * FROM taches WHERE utilisateur_id = $1 AND statut = 'en cours'`;

    const result = await pool.query(sql, [utilisateurId]);
    res.json({ taches: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des tâches.' });
  }
};

exports.obtenirTacheAvecSousTaches = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const tacheId = req.params.id;

  try {
    const tacheResult = await pool.query(
      'SELECT * FROM taches WHERE id = $1 AND utilisateur_id = $2',
      [tacheId, utilisateurId]
    );

    if (tacheResult.rows.length === 0) {
      return res.status(404).json({ erreur: 'Tâche introuvable.' });
    }

    const tache = tacheResult.rows[0];

    const sousTachesResult = await pool.query(
      'SELECT id, titre, statut FROM sous_taches WHERE tache_id = $1',
      [tacheId]
    );

    res.json({
      tache: {
        id: tache.id,
        titre: tache.titre,
        description: tache.description,
        date_debut: tache.date_debut,
        date_echeance: tache.date_echeance,
        statut: tache.statut,
        sous_taches: sousTachesResult.rows
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération de la tâche.' });
  }
};

exports.modifierStatutTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const tacheId = req.params.id;
  const { statut } = req.body;

  if (!statut || !['en cours', 'terminée'].includes(statut)) {
    return res.status(400).json({ erreur: 'Statut invalide.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM taches WHERE id = $1 AND utilisateur_id = $2',
      [tacheId, utilisateurId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Tâche non trouvée ou non autorisée.' });
    }

    await pool.query(
      'UPDATE taches SET statut = $1 WHERE id = $2',
      [statut, tacheId]
    );

    res.json({ message: 'Statut de la tâche mis à jour.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
};

exports.modifierTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const tacheId = req.params.id;
  const { titre, description, date_debut, date_echeance } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM taches WHERE id = $1 AND utilisateur_id = $2',
      [tacheId, utilisateurId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Tâche non trouvée ou non autorisée.' });
    }

    await pool.query(
      'UPDATE taches SET titre = $1, description = $2, date_debut = $3, date_echeance = $4 WHERE id = $5',
      [titre, description, date_debut, date_echeance, tacheId]
    );

    res.json({ message: 'Tâche mise à jour avec succès.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour de la tâche.' });
  }
};

exports.supprimerTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const tacheId = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM taches WHERE id = $1 AND utilisateur_id = $2',
      [tacheId, utilisateurId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erreur: 'Tâche non trouvée ou non autorisée.' });
    }

    res.json({ message: 'Tâche supprimée avec succès.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la suppression.' });
  }
};
