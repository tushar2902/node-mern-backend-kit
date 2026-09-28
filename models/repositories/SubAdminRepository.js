const UserRepository = require('./UserRepository');
const options = require('../../config/options');
const UserHelper = require('../helpers/UserHelper');
const { successMessage } = require('../../config/options');

exports.createAdmin = async (body) => {
  body.role = options.usersRoles.ADMIN;
  body.status = options.defaultStatus.ACTIVE;
  const newAdmin = await UserRepository.checkAndCreate(body);
  if (!newAdmin.success) {
    return { success: false, message: newAdmin.message };
  }

  const { id, firstName, lastName, email, profilePicture } = newAdmin.data;
  const payloadData = { id, firstName, lastName, email, profilePicture };
  const message = options.successMessage.ADD_SUCCESS_MESSAGE('Admin');
  return { success: true, data: payloadData, message };
};

exports.updateAdmin = async (body, query) => {
  const existingAdmin = await UserRepository.getUser(query);
  if (!existingAdmin) {
    return {
      success: false,
      message: options.errorMessage.DOES_NOT_EXIST('Admin'),
    };
  }
  const { success, data, message } = await UserRepository.updateUser(
    query,
    body
  );
  if (!success) {
    return { success, message };
  }
  return { success, data, message };
};

exports.changePassword = async (body, query) => {
  const existingUser = await UserRepository.getUser(query);
  if (!existingUser) {
    return {
      success: false,
      message: options.errorMessage.DOES_NOT_EXIST('Admin'),
    };
  }
  existingUser.password = await UserHelper.generatePassword(body.password);
  await existingUser.save();
  return {
    success: true,
    message: successMessage.SAVED_SUCCESS_MESSAGE('Password'),
  };
};

exports.updateProfile = async (existingData, body) => {
  try {
    existingData.firstName = body.firstName;
    existingData.lastName = body.lastName;
    existingData.profilePicture = body.profilePicture;
    await existingData.save();
    return {
      success: true,
      message: successMessage.UPDATE_SUCCESS_MESSAGE('Profile'),
      data: existingData,
    };
  } catch (e) {
    throw new Error(e);
  }
};
