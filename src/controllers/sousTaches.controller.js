const pool = require('../config/db_pg');

exports.ajouterSousTache = async (req, res) => {
  const utilisateurId = req.utilisateur.id;
  const { tache_id, titre } = req.body;

  if (!tache_id || !titre) {
    return res.status(400).json({ erreur: 'tache_id et titre requis.' });
  }

  try {
    const [taches] = await pool.query(
      'SELECT * FROM taches WHERE id = ? AND utilisateur_id = ?',
      [tache_id, utilisateurId]
    );

    if (taches.length === 0) {
      return res.status(404).json({ erreur: 'Tâche introuvable ou non autorisée.' });
    }

    const [result] = await pool.query(
      'INSERT INTO sous_taches (tache_id, titre) VALUES (?, ?)',
      [tache_id, titre]
    );

    res.status(201).json({
      message: 'Sous-tâche ajoutée avec succès.',
      sous_tache_id: result.insertId
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
      const [rows] = await pool.query(`
        SELECT st.id FROM sous_taches st
        JOIN taches t ON st.tache_id = t.id
        WHERE st.id = ? AND t.utilisateur_id = ?
      `, [sousTacheId, utilisateurId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
      }
  
      await pool.query(
        'UPDATE sous_taches SET statut = ? WHERE id = ?',
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
      const [rows] = await pool.query(`
        SELECT st.id FROM sous_taches st
        JOIN taches t ON st.tache_id = t.id
        WHERE st.id = ? AND t.utilisateur_id = ?
      `, [sousTacheId, utilisateurId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
      }
  
      await pool.query(
        'UPDATE sous_taches SET titre = ? WHERE id = ?',
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
      const [rows] = await pool.query(`
        SELECT st.id FROM sous_taches st
        JOIN taches t ON st.tache_id = t.id
        WHERE st.id = ? AND t.utilisateur_id = ?
      `, [sousTacheId, utilisateurId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ erreur: 'Sous-tâche non trouvée ou non autorisée.' });
      }
  
      await pool.query(
        'DELETE FROM sous_taches WHERE id = ?',
        [sousTacheId]
      );
  
      res.json({ message: 'Sous-tâche supprimée avec succès.' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ erreur: 'Erreur lors de la suppression.' });
    }
  };
  