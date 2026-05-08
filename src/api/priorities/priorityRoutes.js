const express  = require('express');
const router   = express.Router();
const { getPriorities, createPriority, updatePriority, deletePriority } = require('../../controllers/priorityController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.get('/',       authenticateToken, getPriorities);
router.post('/',      authenticateToken, createPriority);
router.put('/:id',    authenticateToken, updatePriority);
router.delete('/:id', authenticateToken, deletePriority);

module.exports = router;
