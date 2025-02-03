const router = require('express').Router();

const V1Routes = require('./v1')

router.use('/v1', V1Routes);

module.exports = router;