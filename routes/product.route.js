const productRouter = require("express").Router();

const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  getAttributeFilters,
} = require("../controller/product.controller");
const upload = require("../middleware/multer");

productRouter.post("/create", upload.single("image"), createProduct);
productRouter.get("/fetch/:id", getProductById);
productRouter.get("/all", getProducts);
productRouter.put("/update/:id", upload.single("image"), updateProduct);
productRouter.get("/attribute", getAttributeFilters);

module.exports = productRouter;
