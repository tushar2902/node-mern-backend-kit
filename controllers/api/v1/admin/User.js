const UserRepository = require('../../../../models/repositories/UserRepository');
const {
  usersRoles,
  resCode,
  genRes,
  errorTypes,
  defaultStatus,
  errorMessage,
  successMessage,
} = require('../../../../config/options');
const UserHelper = require('../../../../models/helpers/UserHelper');

exports.login = async (req, res) => {
  try {
    const { success, message, data } =
      await UserRepository.checkAndAdminLoginWithPassword(req.body);
    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(
            resCode.HTTP_BAD_REQUEST,
            message,
            errorTypes.ACCESS_DENIED_EXCEPTION
          )
        );
    }
    return res.status(resCode.HTTP_OK).json(
      genRes(resCode.HTTP_OK, {
        message,
        data,
      })
    );
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

exports.userUpdate = async (req, res) => {
  try {
    const query = {
      where: {
        _id: req.user.id,
        role: { $in: usersRoles.getAdminArray() },
      },
    };
    const payloadUser = await UserRepository.updateUser(query, req.body);
    if (!payloadUser.success) {
      const { message } = payloadUser;
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, { message }));
    }
    const message = successMessage.UPDATE_SUCCESS_MESSAGE('Profile');
    const outputData = UserHelper.modifyOutputData(payloadUser.data);
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { message, data: outputData }));
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

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const query = {
      where: {
        _id: id,
        status: defaultStatus.ACTIVE,
        role: { $in: usersRoles.getAdminArray() },
      },
      select:
        '_id firstName lastName countryCode mobileNumber email profilePicture status role',
    };
    const existingUser = await UserRepository.getUser(query);
    if (!existingUser) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(resCode.HTTP_BAD_REQUEST, errorMessage.DOES_NOT_EXIST('User'))
        );
    }
    const data = UserHelper.modifyOutputData(existingUser);

    return res.status(resCode.HTTP_OK).json(genRes(resCode.HTTP_OK, { data }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};
