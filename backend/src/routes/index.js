const express = require('express');
const router = express.Router();

// Mount all sub-routes here.
// Adding a new module? Just add another line.
router.use('/auth', require('./authRoutes'));
router.use('/graphs', require('./graphRoutes'));

// health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
