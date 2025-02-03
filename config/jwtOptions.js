const { jwtTokenExpiry } = require('./options');

const jwtOptions = {};
jwtOptions.secretOrKey = process.env.JWT_SECRET_KEY;
jwtOptions.expiry = jwtTokenExpiry;

module.exports = jwtOptions;
