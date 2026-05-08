const express = require('express');
const router  = express.Router();
const { getServices } = require('../../controllers/serviceController');

// Servicios institucionales son públicos
router.get('/', getServices);

module.exports = router;
