const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const OPTIONS = require('../config/options');
const jwtOPTIONS = require('../config/jwtOptions');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: OPTIONS.usersRoles.getAllRolesAsArray(),
      required: true,
    },
    countryCode: {
      type: String,
      default: null,
    },
    mobileNumber: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    tempOtp: {
      type: Number,
      default: null,
    },
    tempOtpExpiresAt: {
      type: Date,
      default: null,
    },
    lastSignInAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      default: OPTIONS.defaultStatus.ACTIVE,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    // Array of references to Address documents
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'User',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual: generate a CloudFront URL for profilePicture on read.
 */
userSchema.virtual('profilePictureUrl').get(function () {
  return OPTIONS.generateCloudFrontUrl(this.profilePicture);
});

/**
 * Instance method: generate a JWT token for the user.
 */
userSchema.methods.genToken = function () {
  const payload = { id: this._id };
  return jwt.sign(payload, jwtOPTIONS.secretOrKey, {
    expiresIn: jwtOPTIONS.expiry,
  });
};

/**
 * Instance method: validate a plain-text password against the stored hash.
 */
userSchema.methods.validPassword = function (password) {
  return this.password ? bcrypt.compareSync(password, this.password) : false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
