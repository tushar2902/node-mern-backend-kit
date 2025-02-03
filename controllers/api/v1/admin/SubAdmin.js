const sequelize = require('sequelize');
const UserRepository = require('../../../../models/repositories/UserRepository');
const SubAdminRepository = require('../../../../models/repositories/SubAdminRepository');

const db = require('../../../../models');
const {
  usersRoles,
  resCode,
  genRes,
  errorTypes,
  defaultStatus,
  errorMessage,
} = require('../../../../config/options');
const { Op } = sequelize;

exports.postCreateAdmin = async (req, res) => {
  try {
    const newAdmin = await SubAdminRepository.createAdmin(req.body);
    if (!newAdmin.success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, newAdmin.message));
    }
    delete newAdmin.success;
    return res.status(resCode.HTTP_OK).json(genRes(resCode.HTTP_OK, newAdmin));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.getAdminListing = async (req, res) => {
  try {
    const {
      search = null,
      limit = 10,
      start = 0,
      order = ['createdAt', 'DESC'],
    } = req.query;
    const query = {
      where: {
        role: usersRoles.ADMIN,
        ...(search && {
          [Op.or]: [
            sequelize.where(
              sequelize.fn(
                'concat',
                sequelize.col('firstName'),
                ' ',
                sequelize.col('lastName')
              ),
              {
                [Op.iLike]: `%${search}%`,
              }
            ),
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }),
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'status'],
      order: [order],
      offset: start,
      limit,
    };
    const existingUser = await UserRepository.findAndCountAll(query);
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { data: existingUser }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
exports.adminChangeStatus = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.params.id,
        role: usersRoles.ADMIN,
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'status'],
    };
    const existingUser = await UserRepository.getUser(query);
    if (!existingUser) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(resCode.HTTP_BAD_REQUEST, errorMessage.DOES_NOT_EXIST('Admin'))
        );
    }
    const status =
      existingUser.status === defaultStatus.ACTIVE
        ? defaultStatus.INACTIVE
        : defaultStatus.ACTIVE;
    await UserRepository.patchUpdateStatus(existingUser, status, false);
    const message = successMessage.UPDATE_SUCCESS_MESSAGE('Status');
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { message }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
exports.deleteAdmin = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.params.id,
        role: usersRoles.ADMIN,
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'status'],
    };
    const existingUser = await UserRepository.getUser(query);
    if (!existingUser) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(resCode.HTTP_BAD_REQUEST, errorMessage.DOES_NOT_EXIST('Admin'))
        );
    }

    await UserRepository.patchUpdateStatus(
      existingUser,
      defaultStatus.DELETED,
      true
    );
    const message = successMessage.DELETE_SUCCESS_MESSAGE('Admin');
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { message }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.params.id,
        role: usersRoles.ADMIN,
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: db.AccessManagement,
          as: 'accessManagement',
          attributes: ['id', 'type', 'add', 'view', 'edit', 'remove'],
          required: false,
        },
      ],
    };
    const payloadUser = await UserRepository.getUser(query);
    if (!payloadUser) {
      const error = errorMessage.DOES_NOT_EXIST('Admin');
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(resCode.HTTP_BAD_REQUEST, error, errorTypes.INPUT_VALIDATION)
        );
    }
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { data: payloadUser }));
  } catch (e) {
    customErrorLogger(e);
    res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.putUpdateAdmin = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.params.id,
        role: usersRoles.ADMIN,
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'firstName', 'lastName', 'email'],
      include: [
        {
          model: db.AccessManagement,
          as: 'accessManagement',
          attributes: ['id', 'type', 'add', 'view', 'edit', 'remove'],
          required: false,
        },
      ],
    };
    const existingAdmin = await SubAdminRepository.updateAdmin(req.body, query);
    if (existingAdmin.success) {
      delete existingAdmin.success;
      return res
        .status(resCode.HTTP_OK)
        .json(genRes(resCode.HTTP_OK, existingAdmin));
    }
    delete existingAdmin.success;
    return res
      .status(resCode.HTTP_BAD_REQUEST)
      .json(genRes(resCode.HTTP_BAD_REQUEST, existingAdmin));
  } catch (e) {
    customErrorLogger(e);
    res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.changePassword = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.params.id,
        role: usersRoles.ADMIN,
        status: { [Op.not]: [defaultStatus.DELETED] },
      },
      attributes: ['id', 'password'],
    };
    const changePasswordResponse = await SubAdminRepository.changePassword(
      req.body,
      query
    );
    if (changePasswordResponse.success) {
      delete changePasswordResponse.success;
      return res
        .status(resCode.HTTP_OK)
        .json(genRes(resCode.HTTP_OK, changePasswordResponse));
    }
    delete changePasswordResponse.success;
    return res
      .status(resCode.HTTP_BAD_REQUEST)
      .json(genRes(resCode.HTTP_BAD_REQUEST, changePasswordResponse));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
exports.putUpdateProfile = async (req, res) => {
  try {
    const query = {
      where: {
        id: req.user.id,
        role: usersRoles.ADMIN,
        status: defaultStatus.ACTIVE,
      },
      attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
    };
    const existingAdmin = await UserRepository.getUser(query);

    const updatedAdmin = await SubAdminRepository.updateProfile(
      existingAdmin,
      req.body
    );
    if (updatedAdmin.success) {
      delete updatedAdmin.success;
      return res
        .status(resCode.HTTP_OK)
        .json(genRes(resCode.HTTP_OK, updatedAdmin));
    }
    delete updatedAdmin.success;
    return res
      .status(resCode.HTTP_BAD_REQUEST)
      .json(genRes(resCode.HTTP_BAD_REQUEST, updatedAdmin));
  } catch (e) {
    customErrorLogger(e);
    res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(
          resCode.HTTP_INTERNAL_SERVER_ERROR,
          errorMessage.SERVER_ERROR,
          errorTypes.INTERNAL_SERVER_ERROR
        )
      );
  }
};
