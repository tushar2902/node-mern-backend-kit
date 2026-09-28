const chalk = require('chalk');
const bcrypt = require('bcryptjs');

const { User, Address } = require('..');

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeWhere = (where = {}) => {
  if (!where || typeof where !== 'object') return {};
  const normalized = { ...where };
  if (normalized.id && !normalized._id) {
    normalized._id = normalized.id;
    delete normalized.id;
  }
  return normalized;
};

// ─── Basic Finders ──────────────────────────────────────────────────────────

exports.findAndCountAll = async (query) => {
  const { where: rawWhere = {}, limit = 10, offset = 0, select = null } = query;
  const where = normalizeWhere(rawWhere);
  const [data, count] = await Promise.all([
    User.find(where)
      .select(select || '')
      .skip(Number(offset))
      .limit(Number(limit))
      .sort(query.sort || { createdAt: -1 }),
    User.countDocuments(where),
  ]);
  return { count, rows: data };
};

exports.getUser = async (query) => {
  const { where: rawWhere = {}, select = null, populate = null } = query;
  const where = normalizeWhere(rawWhere);
  let q = User.findOne(where);
  if (select) q = q.select(select);
  if (populate) q = q.populate(populate);
  return await q.exec();
};

exports.findAll = async (query) => {
  const { where: rawWhere = {}, select = null } = query;
  const where = normalizeWhere(rawWhere);
  return await User.find(where).select(select || '');
};

// ─── Create ──────────────────────────────────────────────────────────────────

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
      password: data.password ? bcrypt.hashSync(data.password, 10) : null,
    };

    // Create address first if provided, then link it
    if (data.address) {
      const newAddress = await Address.create({
        addressLine1: data.address.addressLine1,
        addressLine2: data.address.addressLine2,
        pincode: data.address.pincode,
        city: data.address.city,
        state: data.address.state,
        country: data.address.country,
      });
      payload.address = [newAddress._id];
    }

    const createdUser = await User.create(payload);
    return createdUser;
  } catch (error) {
    throw new Error(error);
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

exports.updateUser = async (query, data) => {
  try {
    const where = normalizeWhere(query.where);
    const existingUser = await User.findOne(where).populate('address');
    if (!existingUser) {
      return { success: false, message: errorMessage.DOES_NOT_EXIST('User') };
    }
    existingUser.firstName = data.firstName;
    existingUser.lastName = data.lastName;
    existingUser.profilePicture = data.profilePicture;
    existingUser.mobileNumber = data.mobileNumber;
    existingUser.countryCode = data.countryCode;

    const address = existingUser.address && existingUser.address[0];
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
    const where = normalizeWhere(query.where);
    const existingUser = await User.findOne(where);
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
      existingUser.mobileNumber = `${existingUser.mobileNumber}${Date.now()}'${defaultStatus.DELETED}'`;
      existingUser.email = `${existingUser.email}${Date.now()}'${defaultStatus.DELETED}'`;
    }
    const savedUser = await existingUser.save();
    return {
      success: true,
      data: savedUser,
      message: 'Status updated successfully',
    };
  } catch (error) {
    throw new Error(error);
  }
};

// ─── Auth ────────────────────────────────────────────────────────────────────

exports.checkAndAdminLoginWithPassword = async (body) => {
  const existingUser = await User.findOne({
    status: { $nin: [defaultStatus.DELETED] },
    email: body.email,
    role: { $in: [usersRoles.SUPER_ADMIN, usersRoles.ADMIN] },
  });
  if (!existingUser) {
    return { success: false, message: errorMessage.NO_USER('data') };
  } else if (!existingUser.validPassword(body.password)) {
    return { success: false, message: errorMessage.INVALID_CREDENTIALS };
  } else if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return { success: false, message: errorMessage.USER_ACCOUNT_BLOCKED };
  } else {
    existingUser.lastSignInAt = new Date();
    await existingUser.save();
    let data = {
      ...UserHelper.modifyOutputData(existingUser),
      token: existingUser.genToken(),
    };
    return { success: true, message: successMessage.LOG('logged in'), data };
  }
};

exports.checkAndLoginWithPassword = async (body) => {
  const existingUser = await User.findOne({
    status: { $nin: [defaultStatus.DELETED] },
    email: body.email,
  });
  if (!existingUser) {
    return { success: false, message: errorMessage.NO_USER('data') };
  }
  if (!existingUser.validPassword(body.password)) {
    return { success: false, message: errorMessage.INVALID_CREDENTIALS };
  }
  if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return { success: false, message: errorMessage.USER_ACCOUNT_BLOCKED };
  }
  existingUser.lastSignInAt = new Date();
  await existingUser.save();
  let data = {
    ...UserHelper.modifyOutputData(existingUser),
    token: existingUser.genToken(),
  };
  return { success: true, message: successMessage.LOG('logged in'), data };
};

exports.checkAndCreate = async (body) => {
  const orConditions = [];
  if (body.email) orConditions.push({ email: body.email });
  if (body.mobileNumber) {
    orConditions.push({
      mobileNumber: body.mobileNumber,
      countryCode: body.countryCode,
    });
  }

  const existingUser = await User.findOne({
    status: { $nin: [defaultStatus.DELETED] },
    ...(orConditions.length && { $or: orConditions }),
  }).select(
    '_id firstName lastName countryCode mobileNumber email profilePicture status lastSignInAt'
  );

  if (!existingUser) {
    const newUser = await this.createUser(body);
    const message = options.successMessage.ADD_SUCCESS_MESSAGE('User');
    let data = {
      ...UserHelper.modifyOutputData(newUser),
      token: newUser.genToken(),
    };
    return { success: true, data, message, isNew: true };
  }
  if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
    return { success: false, message: errorMessage.USER_ACCOUNT_BLOCKED };
  }
  return {
    success: false,
    message: errorMessage.EXISTS_USER('email or phone number'),
  };
};

// ─── OTP ─────────────────────────────────────────────────────────────────────

exports.generateAndSendOtp = async (existingUser, isEmail = false) => {
  const todayDate = new Date();
  const tempOtp = options.genOtp();
  todayDate.setDate(todayDate.getDate() + options.otpExpireInDays);
  existingUser.tempOtp = tempOtp;
  existingUser.tempOtpExpiresAt = todayDate;
  await existingUser.save();
  if (isEmail) {
    const payload = {
      id: existingUser._id,
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
    const orConditions = [];
    if (body.email) orConditions.push({ email: body.email });
    if (body.mobileNumber) {
      orConditions.push({
        mobileNumber: body.mobileNumber,
        countryCode: body.countryCode,
      });
    }

    const existingUser = await User.findOne({
      status: { $nin: [defaultStatus.DELETED] },
      ...(orConditions.length && { $or: orConditions }),
    });

    if (!existingUser) {
      return {
        success: false,
        message: errorMessage.NO_USER('register mobile number'),
      };
    } else if (existingUser && existingUser.status === defaultStatus.INACTIVE) {
      return { success: false, message: errorMessage.USER_ACCOUNT_BLOCKED };
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

exports.checkAndVerifyOtp = async (body) => {
  try {
    const filter = {
      status: { $nin: [defaultStatus.DELETED] },
      tempOtp: body.tempOtp,
      tempOtpExpiresAt: { $gte: new Date() },
      ...(body.type === 'mobileNumber'
        ? { mobileNumber: body.mobileNumber, countryCode: body.countryCode }
        : { email: body.email }),
    };

    const existingUser = await User.findOne(filter);
    if (!existingUser) {
      return { success: false, message: errorMessage.OTP_INVALID, data: null };
    }
    existingUser.tempOtp = null;
    existingUser.lastSignInAt = new Date();
    existingUser.tempOtpExpiresAt = null;
    await existingUser.save();
    let data = {
      ...UserHelper.modifyOutputData(existingUser),
      token: existingUser.genToken(),
    };
    return { success: true, message: successMessage.OTP_VERIFIED(), data };
  } catch (e) {
    throw new Error(e);
  }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

exports.updateProfilePicture = async (existingUser, data) => {
  try {
    existingUser.profilePicture = data.profilePicture;
    return await existingUser.save();
  } catch (e) {
    throw new Error(e);
  }
};

exports.getUserProfile = async (id) => {
  const existingUser = await User.findOne(
    {
      _id: id,
      status: { $in: [defaultStatus.ACTIVE, defaultStatus.PENDING] },
    },
    UserHelper.userAttributes().join(' ')
  ).populate('address');

  if (!existingUser) {
    return { success: false, message: errorMessage.DOES_NOT_EXIST('User') };
  }
  return {
    success: true,
    data: existingUser,
    message: successMessage.DETAIL_MESSAGE('user profile'),
  };
};

// ─── Bulk Create ─────────────────────────────────────────────────────────────

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
      if (parseNumberData && parseNumberData.possible && parseNumberData.valid) {
        payload.mobileNumber = parseNumberData.number.significant;
        payload.countryCode = parseNumberData.countryCode.toString();
      }
      console.log(chalk.yellow('#'), 'payload', payload);

      const orConditions = [];
      if (payload.email) orConditions.push({ email: payload.email });
      if (payload.mobileNumber) {
        orConditions.push({
          mobileNumber: payload.mobileNumber,
          countryCode: payload.countryCode,
        });
      }
      const existingUser = await User.findOne({
        status: { $nin: [defaultStatus.DELETED] },
        ...(orConditions.length && { $or: orConditions }),
      }).select(
        '_id firstName lastName countryCode mobileNumber email profilePicture status lastSignInAt'
      );

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
