const _ = require('lodash');
const sequelize = require('sequelize');
const { User } = require('..');

const { Op } = sequelize;

const generateUsername = (proposedName) =>
  (proposedName += Math.floor(Math.random() * 100 + 1));

const generateUniqueUsername = async (proposedName) => {
  if (!proposedName) {
    proposedName = generateUsername(proposedName);
  }
  try {
    proposedName = _.replace(proposedName, /\s+/g, '');
    const userCount = await User.count({
      where: { userName: { [Op.iLike]: `%${proposedName}%` } },
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
  id: existingUser.id,
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
  'id',
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
