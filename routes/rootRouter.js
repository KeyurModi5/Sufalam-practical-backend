const productRouter = require("./product.route");

const rootRouter = require("express").Router();

rootRouter.use("/api/v1/product", productRouter);

module.exports = rootRouter;
