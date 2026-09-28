const mongoose = require('mongoose');

const OPTIONS = require('../config/options');

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      required: true,
    },
    addressLine2: {
      type: String,
      default: null,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: OPTIONS.defaultCountry,
    },
  },
  {
    timestamps: true,
    collection: 'Address',
  }
);

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
