'use strict';
module.exports = (sequelize, DataTypes) => {
  const Description = sequelize.define('Description', {
    body: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {});
  Description.associate = function(models) {
    Description.belongsTo(models.User);
    Description.belongsTo(models.Category)
  };
  return Description;
};
