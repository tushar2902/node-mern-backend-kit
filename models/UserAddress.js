module.exports = (sequelize, DataTypes) => {
  const UserAddress = sequelize.define(
    'UserAddress',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  UserAddress.associate = (models) => {
    // A UserAddress belongs to a User
    UserAddress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    // A UserAddress belongs to an Address
    UserAddress.belongsTo(models.Address, {
      foreignKey: 'addressId',
      as: 'address',
    });
  };
  return UserAddress;
};
