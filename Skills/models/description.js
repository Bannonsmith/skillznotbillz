'use strict';
module.exports = (sequelize, DataTypes) => {
  const Description = sequelize.define('Description', {
    body: DataTypes.STRING,
  }, {});
  Description.associate = function(models) {
    Description.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'Users',
      onDelete: 'CASCADE'

    });

    Description.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
      //onDelete: 'CASCADE'

    });

  };
  return Description;
};
