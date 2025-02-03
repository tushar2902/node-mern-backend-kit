const express = require('express');
const { checkSchema } = require('express-validator');

const router = express.Router();

const AuthHandler = require('../../../models/helpers/AuthHelper');
const UserControl = require('../../../controllers/api/v1/User');
const UserSchema = require('../../../schema-validation/User');
const ErrorHandleHelper = require('../../../models/helpers/ErrorHandleHelper');

router.post(
  '/login',
  checkSchema(UserSchema.passwordLogin),
  ErrorHandleHelper.requestValidator,
  UserControl.login
);

router.post(
  '/sign-up',
  checkSchema(UserSchema.signUp),
  ErrorHandleHelper.requestValidator,
  UserControl.signup
);

router.post(
  '/send-otp',
  checkSchema(UserSchema.sendOtp),
  ErrorHandleHelper.requestValidator,
  UserControl.sendOtp
);

router.patch(
  '/verify-otp',
  checkSchema(UserSchema.verifyOtp),
  ErrorHandleHelper.requestValidator,
  UserControl.verifyOtp
);

router.put(
  '/',
  AuthHandler.authenticateJWT(),
  checkSchema(UserSchema.updateInfo),
  ErrorHandleHelper.requestValidator,
  UserControl.putUserProfile
);

router.get('/', AuthHandler.authenticateJWT(), UserControl.getUserProfile);

router.patch(
  '/close-account',
  AuthHandler.authenticateJWT(),
  UserControl.deleteUserAccount
);

module.exports = router;
