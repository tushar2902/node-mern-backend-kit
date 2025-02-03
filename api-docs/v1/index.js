const router = require('express').Router();
const basicAuth = require('express-basic-auth');
const admin = require('./admin');
const mobile = require('./web-mobile');

router.use(
  '/admin',
  basicAuth({
    users: {
      [process.env.SWAGGER_ADMIN_USER]: process.env.SWAGGER_ADMIN_PASSWORD,
    },
    challenge: true,
  }),
  admin
);
router.use(
  '/web-mobile',
  basicAuth({
    users: {
      [process.env.SWAGGER_MOBILE_USER]: process.env.SWAGGER_MOBILE_PASSWORD,
    },
    challenge: true,
  }),
  mobile
);
module.exports = router;
