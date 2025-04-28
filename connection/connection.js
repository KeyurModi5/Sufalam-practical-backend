const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Product = require("../models/product.model")(sequelize, Sequelize.DataTypes);
db.Attribute = require("../models/attribute.model")(
  sequelize,
  Sequelize.DataTypes
);
db.Product.associate(db);
db.Attribute.associate(db);

module.exports = db;
