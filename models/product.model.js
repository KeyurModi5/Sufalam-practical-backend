module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    name: DataTypes.STRING,
    image: DataTypes.STRING,
    price: DataTypes.FLOAT,
  });

  Product.associate = (models) => {
    Product.hasMany(models.Attribute, {
      as: "attributes",
      foreignKey: "ProductId",
    });
  };

  return Product;
};
