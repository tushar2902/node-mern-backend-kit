const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const OPTIONS = require('../config/options');
const jwtOPTIONS = require('../config/jwtOptions');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      lastName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM(OPTIONS.usersRoles.getAllRolesAsArray()),
        allowNull: false,
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobileNumber: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      tempOtp: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      tempOtpExpiresAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      lastSignInAt: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: OPTIONS.defaultStatus.ACTIVE,
      },
      profilePicture: {
        allowNull: true,
        type: DataTypes.TEXT,
        get() {
          return OPTIONS.generateCloudFrontUrl(
            this.getDataValue('profilePicture')
          );
        },
        set(file) {
          if (file) {
            this.setDataValue(
              'profilePicture',
              `uploads/${file.split('uploads/')[1]}`
            );
          }
        },
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  User.prototype.genToken = function () {
    const payload = {
      id: this.id,
    };
    return jwt.sign(payload, jwtOPTIONS.secretOrKey, {
      expiresIn: jwtOPTIONS.expiry,
    });
  };
  User.prototype.validPassword = function (password) {
    return this.password ? bcrypt.compareSync(password, this.password) : false;
  };
  User.associate = (models) => {
    // Regular User relationship with Address
    User.belongsToMany(models.Address, {
      through: models.UserAddress,
      foreignKey: 'userId',
      otherKey: 'addressId',
      as: 'address',
    });
  };
  return User;
};
