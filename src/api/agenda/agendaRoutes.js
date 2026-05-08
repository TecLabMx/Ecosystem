const express = require('express');
const router = express.Router();
const {
  getAgenda, createAgendaItem, updateAgendaItem, deleteAgendaItem,
  getPrioridades, createPrioridad, updatePrioridad, deletePrioridad
} = require('../../controllers/agendaController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

// Prioridades — DEBEN ir antes de /:id para que Express no las confunda con un ID
router.get('/prioridades',        authenticateToken, getPrioridades);
router.post('/prioridades',       authenticateToken, createPrioridad);
router.put('/prioridades/:id',    authenticateToken, updatePrioridad);
router.delete('/prioridades/:id', authenticateToken, deletePrioridad);

// Actividades
router.get('/',       authenticateToken, getAgenda);
router.post('/',      authenticateToken, createAgendaItem);
router.put('/:id',    authenticateToken, updateAgendaItem);
router.delete('/:id', authenticateToken, deleteAgendaItem);

module.exports = router;
