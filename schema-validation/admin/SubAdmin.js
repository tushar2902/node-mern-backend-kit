exports.createAdmin = {
  firstName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'First name cannot be empty',
    isString: {
      errorMessage: 'First name must be string',
    },
  },
  lastName: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Last name must be string',
    },
  },
  profilePicture: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'profilePicture must be string',
    },
  },
  email: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
    },
  },
  mobileNumber: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Mobile number cannot be empty',
    isString: {
      errorMessage: 'Mobile number must be string',
    },
  },
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Country Code cannot be empty',
    isString: {
      errorMessage: 'Country Code must be string',
    },
  },
};
exports.updateAdmin = {
  firstName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'First name cannot be empty',
    isString: {
      errorMessage: 'First name must be string',
    },
  },
  lastName: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Last name must be string',
    },
  },
  profilePicture: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    isString: {
      errorMessage: 'Profile picture must be string',
    },
  },
};
exports.updateProfile = {
  firstName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'First name cannot be empty',
    isString: {
      errorMessage: 'First name must be string',
    },
  },
  lastName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Last name cannot be empty',
    isString: {
      errorMessage: 'Last name must be string',
    },
  },
  profilePicture: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Profile Picture must be string',
    },
  },
};
exports.changePassword = {
  password: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Password cannot be empty',
  },
  confirmPassword: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Confirm Password cannot be empty',
    custom: {
      options: (value, { req }) =>
        req.body.confirmPassword === req.body.password,
      errorMessage: 'Confirm Password does not match',
    },
  },
};
