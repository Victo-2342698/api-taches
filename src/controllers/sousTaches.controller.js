const pool = require('../config/db_pg');

exports.ajouterSousTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const { tache_id, titre } = req.body;

  if (!tache_id || !titre) {
    return res.status(400).json({ erreur: 'tache_id et titre requis.' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM taches WHERE id = $1 AND utilisateur_id = $2',
      [tache_id, utilisateurId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Tâche introuvable ou non autorisée.' });
    }

    const insert = await pool.query(
      'INSERT INTO sous_taches (tache_id, titre) VALUES ($1, $2) RETURNING id',
      [tache_id, titre]
    );

    res.status(201).json({
      message: 'Sous-tâche ajoutée avec succès.',
      sous_tache_id: insert.rows[0].id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
};

exports.modifierStatutSousTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const sousTacheId = req.params.id;
  const { statut } = req.body;

  if (!statut || !['en cours', 'terminée'].includes(statut)) {
    return res.status(400).json({ erreur: 'Statut invalide.' });
  }

  try {
    const result = await pool.query(`
      SELECT st.id FROM sous_taches st
      JOIN taches t ON st.tache_id = t.id
      WHERE st.id = $1 AND t.utilisateur_id = $2
    `, [sousTacheId, utilisateurId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
    }

    await pool.query(
      'UPDATE sous_taches SET statut = $1 WHERE id = $2',
      [statut, sousTacheId]
    );

    res.json({ message: 'Statut de la sous-tâche mis à jour.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur serveur.' });
  }
};

exports.modifierSousTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const sousTacheId = req.params.id;
  const { titre } = req.body;

  try {
    const result = await pool.query(`
      SELECT st.id FROM sous_taches st
      JOIN taches t ON st.tache_id = t.id
      WHERE st.id = $1 AND t.utilisateur_id = $2
    `, [sousTacheId, utilisateurId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
    }

    await pool.query(
      'UPDATE sous_taches SET titre = $1 WHERE id = $2',
      [titre, sousTacheId]
    );

    res.json({ message: 'Sous-tâche modifiée avec succès.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la modification.' });
  }
};

exports.supprimerSousTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const sousTacheId = req.params.id;

  try {
    const result = await pool.query(`
      SELECT st.id FROM sous_taches st
      JOIN taches t ON st.tache_id = t.id
      WHERE st.id = $1 AND t.utilisateur_id = $2
    `, [sousTacheId, utilisateurId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
    }

    await pool.query(
      'DELETE FROM sous_taches WHERE id = $1',
      [sousTacheId]
    );

    res.json({ message: 'Sous-tâche supprimée avec succès.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la suppression.' });
  }
};
