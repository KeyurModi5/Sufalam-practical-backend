module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define("Attribute", {
    key: DataTypes.STRING,
    value: DataTypes.STRING,
  });

  Attribute.associate = (models) => {
    Attribute.belongsTo(models.Product, { foreignKey: "ProductId" });
  };

  return Attribute;
};
