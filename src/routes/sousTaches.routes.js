const express = require('express');
const router = express.Router();
const sousTachesController = require('../controllers/sousTaches.controller');

router.post('/', sousTachesController.ajouterSousTache);
router.patch('/:id/statut', sousTachesController.modifierStatutSousTache);
router.put('/:id', sousTachesController.modifierSousTache);
router.delete('/:id', sousTachesController.supprimerSousTache);

module.exports = router;
