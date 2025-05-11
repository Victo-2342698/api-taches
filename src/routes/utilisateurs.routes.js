const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurs.controller');

router.post('/', utilisateurController.ajouterUtilisateur);

module.exports = router;
