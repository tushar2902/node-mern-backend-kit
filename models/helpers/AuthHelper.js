const jwt = require('jsonwebtoken');
const { User } = require('..');
const {
  usersRoles,
  resCode,
  genRes,
  errorTypes,
  defaultStatus,
  errorMessage,
} = require('../../config/options');

const hasRole = (user, roles) => {
  if (roles && roles.length) {
    return [usersRoles.SUPER_ADMIN].includes(user.role)
      ? true
      : roles.indexOf(user.role) > -1;
  }
  return false;
};

const verifyJwt = async (token, roles, force) => {
  const secretOrKey = process.env.JWT_SECRET_KEY;
  return await jwt.verify(token, secretOrKey, async (err, jwtPayload) => {
    if (err) {
      return {
        status: resCode.HTTP_UNAUTHORIZED,
        errorMessage: errorMessage.UNAUTHORIZED_ACCESS,
        errorType: errorTypes.UNAUTHORIZED_ACCESS,
      };
    }
    if (jwtPayload && jwtPayload.id) {
      const existingUser = await User.findOne(
        {
          _id: jwtPayload.id,
          status: { $nin: [defaultStatus.DELETED] },
        },
        {
          tempOtp: 0,
          tempOtpExpiresAt: 0,
          lastSignInAt: 0,
          currentSignInIpAddress: 0,
          createdAt: 0,
          updatedAt: 0,
        }
      );

      if (
        existingUser &&
        ![defaultStatus.ACTIVE, defaultStatus.PENDING].includes(
          existingUser.status
        )
      ) {
        return {
          status: resCode.HTTP_UNAUTHORIZED,
          errorMessage: errorMessage.USER_ACCOUNT_BLOCKED,
          errorType: errorTypes.ACCOUNT_BLOCKED,
        };
      }
      if (existingUser && hasRole(existingUser, roles)) {
        //!! do not convert existing user to json
        return { status: resCode.HTTP_OK, user: existingUser };
      }
      return {
        status: resCode.HTTP_UNAUTHORIZED,
        errorMessage: errorMessage.UNAUTHORIZED_ACCESS,
        errorType: errorTypes.UNAUTHORIZED_ACCESS,
      };
    }
    if (!force) {
      return { status: resCode.HTTP_OK };
    }
    return {
      status: resCode.HTTP_FORBIDDEN,
      errorMessage: errorMessage.FORBIDDEN,
      errorType: errorTypes.FORBIDDEN,
    };
  });
};
exports.verifyJwt = verifyJwt;
exports.authenticateJWT = function (
  roles = usersRoles.getNonAdminArray(),
  force = true
) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      return verifyJwt(token, roles, force).then((checkAuth) => {
        if (checkAuth.status === resCode.HTTP_OK) {
          req.authenticated = true;
          req.user = checkAuth.user;
          next();
        } else {
          return res
            .status(checkAuth.status)
            .json(
              genRes(
                checkAuth.status,
                checkAuth.errorMessage,
                checkAuth.errorTypes
              )
            );
        }
      });
    }
    return res
      .status(resCode.HTTP_UNAUTHORIZED)
      .json(
        genRes(
          resCode.HTTP_UNAUTHORIZED,
          errorMessage.UNAUTHORIZED_ACCESS,
          errorTypes.UNAUTHORIZED_ACCESS
        )
      );
  };
};
