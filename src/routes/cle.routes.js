const express = require('express');
const router = express.Router();
const cleController = require('../controllers/cle.controller');

router.post('/', cleController.recupererOuGenererCle);

module.exports = router;
