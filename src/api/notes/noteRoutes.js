const express = require('express');
const router = express.Router();
const { getNotes, createNote, updateNote, deleteNote } = require('../../controllers/noteController');
const { authenticateToken } = require('../../middlewares/authMiddleware');

router.get('/',        authenticateToken, getNotes);
router.post('/',       authenticateToken, createNote);
router.put('/:id',     authenticateToken, updateNote);
router.delete('/:id',  authenticateToken, deleteNote);

module.exports = router;
