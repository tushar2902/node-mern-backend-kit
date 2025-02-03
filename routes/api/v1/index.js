const express = require('express');

const router = express.Router();

const User = require('./User');
const SharedRouter = require('./Shared');
const AdminRouter = require('./admin/index');

router.use('/user', User);
router.use('/shared', SharedRouter);
router.use('/admin', AdminRouter);

module.exports = router;
