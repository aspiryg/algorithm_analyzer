const express = require('express');
const router = express.Router();
const { createGraph, getMyGraphs, getGraph, updateGraph, deleteGraph } = require('../controllers/graphController');
const { protect } = require('../middleware/auth');

// graph CRUD requires authentication -- you need an account to save/load graphs.
// the visualization itself runs entirely client-side and doesn't need auth.
router.use(protect);

router.route('/').get(getMyGraphs).post(createGraph);
router.route('/:id').get(getGraph).put(updateGraph).delete(deleteGraph);

module.exports = router;
