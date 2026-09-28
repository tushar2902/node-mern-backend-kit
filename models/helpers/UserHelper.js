const _ = require('lodash');
const { User } = require('..');

const generateUsername = (proposedName) =>
  (proposedName += Math.floor(Math.random() * 100 + 1));

const generateUniqueUsername = async (proposedName) => {
  if (!proposedName) {
    proposedName = generateUsername(proposedName);
  }
  try {
    proposedName = _.replace(proposedName, /\s+/g, '');
    // Replace Sequelize Op.iLike with MongoDB case-insensitive regex
    const userCount = await User.countDocuments({
      userName: { $regex: proposedName, $options: 'i' },
    });
    if (userCount > 0) {
      return generateUniqueUsername(generateUsername(proposedName));
    }
    return _.replace(proposedName, /\s+/g, '');
  } catch (error) {
    throw new Error(error);
  }
};

exports.generateUniqueUsername = generateUniqueUsername;

exports.modifyOutputData = (existingUser) => ({
  id: existingUser._id,
  email: existingUser.email,
  firstName: existingUser.firstName,
  lastName: existingUser.lastName,
  mobileNumber: existingUser.mobileNumber,
  countryCode: existingUser.countryCode,
  role: existingUser.role,
  status: existingUser.status,
  profilePicture: existingUser.profilePicture,
  lastSignInAt: existingUser.lastSignInAt,
});

exports.userAttributes = () => [
  '_id',
  'createdAt',
  'updatedAt',
  'role',
  'countryCode',
  'mobileNumber',
  'email',
  'firstName',
  'lastName',
  'status',
  'profilePicture',
];

exports.generatePassword = async (password) => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, bcrypt.genSaltSync(8));
};
