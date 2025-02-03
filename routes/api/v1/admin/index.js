const express = require('express');

const router = express.Router();
const AuthHandler = require('../../../../models/helpers/AuthHelper');

const UserRouter = require('./User');
const SubAdminRouter = require('./SubAdmin');
const { usersRoles } = require('../../../../config/options');

router.use('/user', UserRouter);

router.use(
  '/sub-admin',
  AuthHandler.authenticateJWT(usersRoles.getAdminArray()),
  SubAdminRouter
);

module.exports = router;
