const OPTIONS = require('../config/options');

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define(
    'Address',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      addressLine1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      addressLine2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: OPTIONS.defaultCountry,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  Address.associate = (models) => {
    Address.hasMany(models.UserAddress, {
      foreignKey: 'addressId',
      as: 'addressUsers',
    });
  };
  return Address;
};
