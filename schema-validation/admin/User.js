exports.emailLogin = {
  email: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be string',
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

exports.updateInfo = {
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be string',
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
};

exports.listing = {
  startDate: {
    in: ['query'],
    notEmpty: false,
  },
  endDate: {
    in: ['query'],
    notEmpty: false,
  },
  search: {
    in: ['query'],
    notEmpty: false,
  },
  status: {
    in: ['query'],
    notEmpty: false,
    custom: {
      options: (value, { req }) => {
        if (
          value &&
          !['active', 'inactive', 'pending', 'rejected'].includes(value)
        ) {
          return false;
        } else {
          return true;
        }
      },
      errorMessage: `status value must be 'active', 'inactive','pending', 'reject'`,
    },
  },
};

exports.createOrUpdate = {
  firstName: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'First name cannot be empty',
    isString: {
      errorMessage: 'First name must be a string',
    },
  },
  lastName: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Last name must be a string',
    },
  },
  email: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Email cannot be empty',
    isString: {
      errorMessage: 'Email must be a string',
    },
  },
  profilePicture: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Profile picture must be a string',
    },
  },
  countryCode: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Country code cannot be empty',
    isString: {
      errorMessage: 'Country code must be a string',
    },
  },
  mobileNumber: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Mobile number cannot be empty',
    isString: {
      errorMessage: 'Mobile number must be a string',
    },
  },
  addressLine1: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    errorMessage: 'Address line 1 cannot be empty',
    isString: {
      errorMessage: 'Address line 1 must be a string',
    },
  },
  addressLine2: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Address line 2 must be a string',
    },
  },
  city: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    errorMessage: 'City can be empty',
    isString: {
      errorMessage: 'City must be a string',
    },
  },
  state: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    errorMessage: 'State can be empty',
    isString: {
      errorMessage: 'State must be a string',
    },
  },
  pincode: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    errorMessage: 'Pincode can be empty',
    isString: {
      errorMessage: 'Pincode must be a string',
    },
  },
  country: {
    in: ['body'],
    trim: true,
    notEmpty: false,
    isString: {
      errorMessage: 'Country must be a string',
    },
  },
};

exports.changeStatus = {
  status: {
    in: ['body'],
    trim: true,
    notEmpty: true,
    isIn: {
      options: [['active', 'inactive', 'rejected']],
      errorMessage: `status value must be 'active', 'inactive', 'reject'`,
    },
    errorMessage: 'status cannot be empty',
    isString: {
      errorMessage: 'status must be string',
    },
  },
};
