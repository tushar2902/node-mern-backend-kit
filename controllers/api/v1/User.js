const UserRepository = require('../../../models/repositories/UserRepository');

const {
  genRes,
  errorMessage,
  resCode,
  defaultStatus,
  errorTypes,
} = require('../../../config/options');

exports.login = async (req, res) => {
  try {
    const responseUser = await UserRepository.checkAndLoginWithPassword(
      req.body
    );
    if (!responseUser.success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, responseUser.message));
    }
    delete responseUser.success;
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, responseUser));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};

exports.signup = async (req, res) => {
  try {
    const { success, data, message } = await UserRepository.checkAndCreate(
      req.body
    );
    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, message));
    }
    return res
      .status(resCode.HTTP_OK)
      .json(genRes(resCode.HTTP_OK, { data, message }));
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { success, message } = await UserRepository.checkUserAndLoginWithOtp(
      req.body
    );
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
      })
    );
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { success, message, data } = await UserRepository.checkAndVerifyOtp(
      req.body
    );
    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(
          genRes(resCode.HTTP_BAD_REQUEST, message, errorTypes.INPUT_VALIDATION)
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
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};

exports.putUserProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const query = {
      where: {
        id,
      },
      attributes: {
        exclude: ['tempOtp', 'tempOtpExpiresAt', 'password', 'role'],
      },
    };
    const { success, message, data } = await UserRepository.updateUser(
      query,
      req.body
    );
    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, message));
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
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { success, message, data } = await UserRepository.getUserProfile(
      req.user.id
    );
    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, message));
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
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};
exports.deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await UserRepository.getUser({
      where: { id },
    });
    if (!user) {
      return res
        .status(resCode.HTTP_NOT_FOUND)
        .json(
          genRes(resCode.HTTP_NOT_FOUND, errorMessage.DOES_NOT_EXIST('User'))
        );
    }
    const { success, message } = await UserRepository.patchUpdateStatus(
      user,
      defaultStatus.DELETED,
      true
    );

    if (!success) {
      return res
        .status(resCode.HTTP_BAD_REQUEST)
        .json(genRes(resCode.HTTP_BAD_REQUEST, message));
    }

    return res
      .status(resCode.HTTP_OK)
      .json(
        genRes(resCode.HTTP_OK, { message: 'Account deleted successfully' })
      );
  } catch (e) {
    customErrorLogger(e);
    return res
      .status(resCode.HTTP_INTERNAL_SERVER_ERROR)
      .json(
        genRes(resCode.HTTP_INTERNAL_SERVER_ERROR, errorMessage.SERVER_ERROR)
      );
  }
};
