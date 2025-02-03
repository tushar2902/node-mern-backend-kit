const express = require('express');

const router = express.Router();

const ApiRouter = require('./api');

router.use('/api', ApiRouter);

module.exports = router;
