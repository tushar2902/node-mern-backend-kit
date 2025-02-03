const sequelize = require('sequelize');
const chalk = require('chalk');

const { User } = require('..');
const { Op } = sequelize;

const {
  errorMessage,
  defaultStatus,
  usersRoles,
  successMessage,
} = require('../../config/options');
const UserHelper = require('../helpers/UserHelper');

const options = require('../../config/options');
const EmailHelper = require('../helpers/EmailHelper');
const { parseMobileNumber } = require('../helpers/UtilHelper');
const { Address } = require('../../models');

exports.findAndCountAll = async (query) => await User.findAndCountAll(query);

exports.getUser = async (query) => await User.findOne(query);

exports.findAll = async (query) => await User.findAll(query);

exports.createUser = async (data) => {
  try {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode: data.countryCode,
      mobileNumber: data.mobileNumber,
      tempOtp: data.tempOtp || null,
      tempOtpExpiresAt: data.tempOtpExpiresAt || null,
      role: data.role || usersRoles.ADMIN,
      profilePicture: data.profilePicture || null,
      status: data.status || defaultStatus.PENDING,
      email: data.email,
      ...(data.address && {
        address: {
          addressLine1: data.address.addressLine1,
          addressLine2: data.address.addressLine2,
          pincode: data.address.pincode,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          createdBy: data.address.createdBy,
        },
      }),
    };
    const createdUser = await User.create(
      payload,
      ...(data.address && {
        include: [
          {
            model: Address,
            as: 'address',
          },
        ],
      })
    );
    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};

exports.updateUser = async (query, data) => {
  try {
    const existingUser = await User.findOne(query);
    if (!existingUser) {
      return { success: false, message: errorMessage.DOES_NOT_EXIST('User') };
    }
    existingUser.firstName = data.firstName;
    existingUser.lastName = data.lastName;
    existingUser.profilePicture = data.profilePicture;
    existingUser.mobileNumber = data.mobileNumber;
    existingUser.countryCode = data.countryCode;

    const address = existingUser.address[0];
    if (address) {
      address.addressLine1 = data.addressLine1 || address.addressLine1;
      address.addressLine2 = data.addressLine2 || address.addressLine2;
      address.city = data.city || address.city;
      address.state = data.state || address.state;
      address.country = data.country || address.country;
      address.pincode = data.pincode || address.pincode;
      await address.save();
    }
    await existingUser.save();
    return {
      success: true,
      data: existingUser,
      message: successMessage.UPDATE_SUCCESS_MESSAGE('User'),
    };
  } catch (e) {
    throw new Error(e);
  }
};

exports.updateContactsDetails = async (query, data) => {
  try {
    const existingUser = await User.findOne(query);
    if (!existingUser) {
      return { success: false, message: errorMessage.DOES_NOT_EXIST('User') };
    }
    existingUser.twitterURL = data.twitterURL;
    existingUser.linkedInURL = data.linkedInURL;
    existingUser.facebookURL = data.facebookURL;
    existingUser.websiteURL = data.websiteURL;
    await existingUser.save();
    return { success: true, data: existingUser };
  } catch (e) {
    throw new Error(e);
  }
};

exports.patchUpdateStatus = async (existingUser, status, isDelete) => {
  try {
    existingUser.status = status;
    if (isDelete) {
      existingUser.status = defaultStatus.DELETED;
      existingUser.mobileNumber = `${existingUser.mobileNumber}${Date.now()}'${
        defaultStatus.DELETED
      }'`;
      existingUser.email = `${existingUser.email}${Date.now()}'${
        defaultStatus.DELETED
      }'`;
    }
    return await existingUser.save();
  } catch (error) {
    throw new Error(error);
  }
};
exports.checkAndAdminLoginWithPassword = async (body) => {
  const query = {
    where: {
      status: { [Op.notIn]: [defaultStatus.DELETED] },
      email: body.email,
      role: [usersRoles.SUPER_ADMIN, usersRoles.ADMIN],
    },
  };
  const existingUser = await this.getUser(query);
  if (!existingUser) {
    return {
      success: false,
      message: errorMessage.NO_USER('data'),
    };
  } else if (!existingUser.validPassword(body.password)) {
    return {
      success: false,
      message: errorMessage.INVALID_CREDENTIALS,
    };
  } else if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return {
      success: false,
      message: errorMessage.USER_ACCOUNT_BLOCKED,
    };
  } else {
    existingUser.lastSignInAt = new Date();
    await existingUser.save();
    let data = {
      ...UserHelper.modifyOutputData(existingUser),
      token: existingUser.genToken(),
    };
    return {
      success: true,
      message: successMessage.LOG('logged in'),
      data,
    };
  }
};
exports.checkAndLoginWithPassword = async (body) => {
  const query = {
    where: {
      status: { [Op.notIn]: [defaultStatus.DELETED] },
      email: body.email,
    },
  };
  const existingUser = await this.getUser(query);
  if (!existingUser) {
    return {
      success: false,
      message: errorMessage.NO_USER('data'),
    };
  }
  if (!existingUser.validPassword(body.password)) {
    return {
      success: false,
      message: errorMessage.INVALID_CREDENTIALS,
    };
  }
  if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return {
      success: false,
      message: errorMessage.USER_ACCOUNT_BLOCKED,
    };
  }
  existingUser.lastSignInAt = new Date();
  await existingUser.save();
  let data = {
    ...UserHelper.modifyOutputData(existingUser),
    token: existingUser.genToken(),
  };
  return {
    success: true,
    message: successMessage.LOG('logged in'),
    data,
  };
};

exports.checkAndCreate = async (body) => {
  const query = {
    where: {
      status: { [Op.notIn]: [defaultStatus.DELETED] },
      [Op.or]: [
        body.email && {
          email: body.email,
        },
        body.mobileNumber && {
          [Op.and]: {
            mobileNumber: body.mobileNumber,
            countryCode: body.countryCode,
          },
        },
      ],
    },
    attributes: [
      'id',
      'firstName',
      'lastName',
      'countryCode',
      'mobileNumber',
      'email',
      'profilePicture',
      'status',
      'lastSignInAt',
    ],
  };
  const existingUser = await this.getUser(query);
  if (!existingUser) {
    const newUser = await this.createUser(body);
    // await this.generateAndSendOtp(newUser);
    // if (newUser.role === usersRoles.USER) {
    //   EmailHelper.sendEmail(
    //     {
    //       id: newUser.id,
    //       firstName: newUser.firstName,
    //       lastName: newUser.lastName,
    //       email: newUser.email,
    //     },
    //     emailType.EMAIL_REGISTERED_SUCCESSFULLY
    //   );
    // }
    const message = options.successMessage.ADD_SUCCESS_MESSAGE('User');
    let data = {
      ...UserHelper.modifyOutputData(newUser),
      token: newUser.genToken(),
    };
    return {
      success: true,
      data,
      message,
      isNew: true,
    };
  }
  if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return {
      success: false,
      message: errorMessage.USER_ACCOUNT_BLOCKED,
    };
  }
  return {
    success: false,
    message: errorMessage.EXISTS_USER('email or phone number'),
  };
};

exports.generateAndSendOtp = async (existingUser, isEmail = false) => {
  const todayDate = new Date();
  const tempOtp = options.genOtp();
  todayDate.setDate(todayDate.getDate() + options.otpExpireInDays);
  existingUser.tempOtp = tempOtp;
  existingUser.tempOtpExpiresAt = todayDate;
  await existingUser.save();
  if (!isEmail) {
    // const payload = {
    //   id: existingUser.id,
    //   firstName: existingUser.firstName,
    //   lastName: existingUser.lastName,
    //   countryCode: isSecondary
    //     ? existingUser.secondaryCountryCode
    //     : existingUser.countryCode,
    //   mobileNumber: existingUser.mobileNumber,
    // };
    // SMSHelper.sendMobileOtp(payload, tempOtp);
  } else {
    const payload = {
      id: existingUser.id,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      tempOtp,
    };
    EmailHelper.sendEmail(payload, options.emailType.EMAIL_OTP_VERIFICATION);
  }
};
exports.checkUserAndLoginWithOtp = async (body) => {
  try {
    const query = {
      where: {
        status: { [Op.notIn]: [defaultStatus.DELETED] },
        ...(body.email && {
          email: body.email,
        }),
        ...(body.mobileNumber && {
          [Op.and]: {
            mobileNumber: body.mobileNumber,
            countryCode: body.countryCode,
          },
        }),
      },
    };
    const existingUser = await this.getUser(query);
    if (!existingUser) {
      return {
        success: false,
        message: errorMessage.NO_USER('register mobile number'),
      };
    } else if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
      return {
        success: false,
        message: errorMessage.USER_ACCOUNT_BLOCKED,
      };
    }
    await this.generateAndSendOtp(existingUser, false);
    return {
      success: true,
      message: successMessage.OTP_SEND('register mobile number'),
    };
  } catch (e) {
    throw new Error(e);
  }
};
exports.checkAndVerifyOtp = async (body, isEmail = false) => {
  try {
    const query = {
      where: {
        status: { [Op.notIn]: [defaultStatus.DELETED] },
        tempOtp: body.tempOtp,
        tempOtpExpiresAt: { [Op.gte]: new Date() },
        ...(body.type === 'mobileNumber'
          ? { mobileNumber: body.mobileNumber, countryCode: body.countryCode }
          : { email: body.email }),
      },
      logging: true,
    };
    const existingUser = await this.getUser(query);
    if (!existingUser) {
      return {
        success: false,
        message: errorMessage.OTP_INVALID,
        data: null,
      };
    }
    existingUser.tempOtp = null;
    existingUser.lastSignInAt = new Date();
    existingUser.tempOtpExpiresAt = null;
    await existingUser.save();
    let data = {
      ...UserHelper.modifyOutputData(existingUser),
      token: existingUser.genToken(),
    };
    return {
      success: true,
      message: successMessage.OTP_VERIFIED(),
      data,
    };
  } catch (e) {
    throw new Error(e);
  }
};
exports.updateProfilePicture = async (existingUser, data) => {
  try {
    existingUser.profilePicture = data.profilePicture;
    return await existingUser.save();
  } catch (e) {
    throw new Error(e);
  }
};
exports.getUserProfile = async (id) => {
  const query = {
    where: {
      id,
      status: [defaultStatus.ACTIVE, defaultStatus.PENDING],
    },
    attributes: UserHelper.userAttributes(),
    include: [
      {
        model: db.Address,
        as: 'address',
        required: false,
      },
    ],
  };
  const existingUser = await this.getUser(query);
  if (!existingUser) {
    return {
      success: false,
      message: errorMessage.DOES_NOT_EXIST('User'),
    };
  }
  return {
    success: true,
    data: existingUser,
    message: successMessage.DETAIL_MESSAGE('user profile'),
  };
};
exports.bulkCreate = async (users = []) => {
  try {
    console.log(chalk.yellow('#'), 'Bulk data of length: ', users.length);
    for (const user of users) {
      const payload = {
        firstName: user['First Name'],
        lastName: user['Last Name'],
        email: user.Email,
        role: usersRoles.USER,
        registrationPlatform: 'upload',
        isFromAdmin: true,
      };
      const parseNumberData = parseMobileNumber(`+${user.Mobile.toString()}`);
      if (
        parseNumberData &&
        parseNumberData.possible &&
        parseNumberData.valid
      ) {
        payload.mobileNumber = parseNumberData.number.significant;
        payload.countryCode = parseNumberData.countryCode.toString();
      }
      console.log(chalk.yellow('#'), 'payload', payload);
      const query = {
        where: {
          status: { [Op.notIn]: [defaultStatus.DELETED] },
          [Op.or]: [
            payload.email && {
              email: payload.email,
            },
            payload.mobileNumber && {
              [Op.and]: {
                mobileNumber: payload.mobileNumber,
                countryCode: payload.countryCode,
              },
            },
          ],
        },
        attributes: [
          'id',
          'firstName',
          'lastName',
          'countryCode',
          'mobileNumber',
          'email',
          'profilePicture',
          'status',
          'lastSignInAt',
        ],
      };
      const existingUser = await this.getUser(query);
      if (!existingUser) {
        const newUser = await this.createUser(payload);
        console.log(
          chalk.green('✓'),
          options.successMessage.ADD_SUCCESS_MESSAGE('User'),
          ':',
          JSON.stringify(newUser)
        );
      } else {
        console.log(
          chalk.red('X'),
          errorMessage.EXISTS_USER('email'),
          ':',
          JSON.stringify(payload)
        );
        existingUser.lastName = payload.lastName;
        existingUser.firstName = payload.firstName;
        if (
          parseNumberData &&
          parseNumberData.possible &&
          parseNumberData.valid
        ) {
          existingUser.mobileNumber = parseNumberData.number.significant;
          existingUser.countryCode = parseNumberData.countryCode.toString();
        }
        await existingUser.save();
        console.log(
          chalk.green('✓'),
          'Updating first name and last name',
          ':',
          JSON.stringify(existingUser)
        );
      }
    }
    return;
  } catch (error) {
    throw new Error(error);
  }
};
