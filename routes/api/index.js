const express = require('express');

const router = express.Router();

const indexRouterV1 = require('./v1');

/**
 * APIs routes.
 */
router.use('/v1', indexRouterV1);

module.exports = router;
