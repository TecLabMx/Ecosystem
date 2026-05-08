const express = require('express');
const router  = express.Router();
const { getDirectory } = require('../../controllers/directoryController');

// Directorio es información pública — no requiere autenticación
router.get('/', getDirectory);

module.exports = router;
