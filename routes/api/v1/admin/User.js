const express = require('express');

const router = express.Router();
const { checkSchema } = require('express-validator');

const AuthHandler = require('../../../../models/helpers/AuthHelper');
const UserControl = require('../../../../controllers/api/v1/admin/User');
const UserSchema = require('../../../../schema-validation/admin/User');
const ErrorHandleHelper = require('../../../../models/helpers/ErrorHandleHelper');
const { usersRoles } = require('../../../../config/options');

router.post(
  '/login',
  checkSchema(UserSchema.emailLogin),
  ErrorHandleHelper.requestValidator,
  UserControl.login
);

router.put(
  '/',
  AuthHandler.authenticateJWT(usersRoles.getAdminArray()),
  checkSchema(UserSchema.updateInfo),
  ErrorHandleHelper.requestValidator,
  UserControl.userUpdate
);

router.get(
  '/',
  AuthHandler.authenticateJWT(usersRoles.getAdminArray()),
  UserControl.getUserProfile
);

module.exports = router;
