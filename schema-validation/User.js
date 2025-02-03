exports.passwordLogin = {
  email: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Field cannot be empty',
    isString: {
      errorMessage: 'Field must be string',
    },
  },
  password: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Password cannot be empty',
    isString: {
      errorMessage: 'Password must be string',
    },
  },
};

exports.sendOtp = {
  type: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Type cannot be empty',
    isIn: {
      options: [['email', 'mobileNumber']],
      errorMessage: `Type value must be email or mobileNumber`,
    },
    isString: {
      errorMessage: 'Type must be string',
    },
  },
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be string',
    },
    customSanitizer: {
      options: (value, { req, location, path }) => {
        return value.charAt(0) === '+'
          ? value.substring(1, value.length)
          : value;
      },
    },
  },
  mobileNumber: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Mobile number cannot be empty',
    isString: {
      errorMessage: 'Mobile number must be string',
    },
  },
  email: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type === 'email',
      else: (value) => false,
    },
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
    },
    isEmail: {
      bail: true,
      errorMessage: 'Enter a valid Email',
    },
  },
};

exports.verifyOtp = {
  type: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Type cannot be empty',
    isIn: {
      options: [['email', 'mobileNumber']],
      errorMessage: `Type value must be email or mobileNumber`,
    },
    isString: {
      errorMessage: 'Type must be string',
    },
  },
  tempOtp: {
    in: ['body'],
    notEmpty: true,
    errorMessage: 'Temp OTP cannot be empty',
    isInt: {
      errorMessage: 'Temp OTP must be integer',
    },
  },
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be string',
    },
    customSanitizer: {
      options: (value, { req, location, path }) => {
        return value.charAt(0) === '+'
          ? value.substring(1, value.length)
          : value;
      },
    },
  },
  mobileNumber: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Mobile number cannot be empty',
    isString: {
      errorMessage: 'Mobile number must be string',
    },
  },
  email: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type === 'email',
      else: (value) => false,
    },
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
    },
    isEmail: {
      bail: true,
      errorMessage: 'Enter a valid Email',
    },
  },
};

exports.updateInfo = {
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
    notEmpty: {
      if: (value, { req, location, path }) => !!req.body.profilePicture,
      else: (value) => false,
    },
  },
  dateOfBirth: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'dateOfBirth cannot be empty',
    isString: {
      errorMessage: 'dateOfBirth must be string',
    },
  },
  city: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'City cannot be empty',
    isString: {
      errorMessage: 'City must be string',
    },
  },
  state: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    errorMessage: 'State cannot be empty',
    isString: {
      errorMessage: 'State must be string',
    },
  },
  pincode: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    errorMessage: 'Pincode cannot be empty',
    isString: {
      errorMessage: 'Pincode must be string',
    },
  },
  countryName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Country name cannot be empty',
    isString: {
      errorMessage: 'Country name must be string',
    },
  },
};
exports.signUp = {
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be string',
    },
    customSanitizer: {
      options: (value, { req, location, path }) => {
        return value.charAt(0) === '+'
          ? value.substring(1, value.length)
          : value;
      },
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
  email: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
    },
  },
};

exports.generatePassword = {
  confirmPassword: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'confirm password cannot be empty',
    isString: {
      errorMessage: 'Confirm password must be string',
    },
    custom: {
      options: (value, { req }) =>
        req.body.confirmPassword === req.body.password,
      errorMessage: 'confirm password does not match',
    },
  },
  password: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Password cannot be empty',
    isString: {
      errorMessage: 'Password must be string',
    },
  },
};
exports.changePassword = {
  newPassword: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'New password cannot be empty',
  },
  currentPassword: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Current password cannot be empty',
  },
  confirmPassword: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'confirm password cannot be empty',
    custom: {
      options: (value, { req }) =>
        req.body.newPassword === req.body.confirmPassword,
      errorMessage: 'confirm password does not match',
    },
  },
};
const emailMobile = {
  type: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Type cannot be empty',
    isIn: {
      options: [['email', 'mobileNumber']],
      errorMessage: `Type value must be email or mobileNumber`,
    },
    isString: {
      errorMessage: 'Type must be string',
    },
  },
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be string',
    },
    customSanitizer: {
      options: (value, { req, location, path }) => {
        return value.charAt(0) === '+'
          ? value.substring(1, value.length)
          : value;
      },
    },
  },
  mobileNumber: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type !== 'email',
      else: (value) => false,
    },
    errorMessage: 'Mobile number cannot be empty',
    isString: {
      errorMessage: 'Mobile number must be string',
    },
  },
  email: {
    in: ['body'],
    trim: true,
    notEmpty: {
      if: (value, { req, location, path }) => req.body.type === 'email',
      else: (value) => false,
    },
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
    },
    isEmail: {
      bail: true,
      errorMessage: 'Enter a valid Email',
    },
  },
};
exports.addEmailMobileNumber = {
  ...emailMobile,
  password: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Password cannot be empty',
  },
};
exports.markPrimary = {
  ...emailMobile,
  password: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Password cannot be empty',
  },
};
