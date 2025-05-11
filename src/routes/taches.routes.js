const express = require('express');
const router = express.Router();
const tachesController = require('../controllers/taches.controller'); 
router.post('/', tachesController.ajouterTache);

router.get('/', tachesController.listerTaches);

router.get('/:id', tachesController.obtenirTacheAvecSousTaches);

router.patch('/:id/statut', tachesController.modifierStatutTache);

router.put('/:id', tachesController.modifierTache);

router.delete('/:id', tachesController.supprimerTache);

module.exports = router;
