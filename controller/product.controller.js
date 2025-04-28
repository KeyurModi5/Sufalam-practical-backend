const { Product, Attribute } = require("../connection/connection");
const { Sequelize } = require("sequelize");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, attributes } = req.body;
    const image = req.file ? req.file.filename : null;
    const product = await Product.create({ name, price, image });
    const attrArray = JSON.parse(attributes || "[]");
    for (const attr of attrArray) {
      await Attribute.create({
        key: attr.key,
        value: attr.value,
        ProductId: product.id,
      });
    }
    res.json({ product, message: "Product created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Attribute, as: "attributes" }],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      sort,
      page = 1,
      limit = 10,
      ...filters
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};
    const attributeFilters = [];

    if (name) {
      where.name = { [Sequelize.Op.iLike]: `%${name}%` };
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Parse attribute filters (e.g., color, size)
    Object.entries(filters).forEach(([key, value]) => {
      attributeFilters.push({
        key: key,
        value: value,
      });
    });
    console.log(attributeFilters);
    const products = await Product.findAll({
      where,
      include: [{ model: Attribute, as: "attributes" }],
      order: sort
        ? [["createdAt", sort.toUpperCase()]]
        : [["createdAt", "DESC"]],
    });

    // Filter by attributes if provided
    const filteredProducts = attributeFilters.length
      ? products.filter((product) =>
          attributeFilters.every((filter) =>
            product.attributes.some(
              (attr) => attr.key === filter.key && attr.value === filter.value
            )
          )
        )
      : products;

    const paginatedProducts = filteredProducts.slice(
      offset,
      offset + Number(limit)
    );

    res.json({
      total: filteredProducts.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filteredProducts.length / limit),
      data: paginatedProducts,
      message: "List Fetch successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, attributes } = req.body;
    const image = req.file ? req.file.filename : undefined;
    const product = await Product.findByPk(id);
    await product.update({ name, price, ...(image && { image }) });
    await Attribute.destroy({ where: { ProductId: id } });
    const attrArray = JSON.parse(attributes || "[]");
    for (const attr of attrArray) {
      await Attribute.create({
        key: attr.key,
        value: attr.value,
        ProductId: product.id,
      });
    }
    res.json({ product, message: "Product Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttributeFilters = async (req, res) => {
  try {
    const attributes = await Attribute.findAll();

    const attributeMap = {};

    attributes.forEach((attr) => {
      if (!attributeMap[attr.key]) {
        attributeMap[attr.key] = new Set();
      }
      attributeMap[attr.key].add(attr.value);
    });

    const result = Object.entries(attributeMap).map(([key, valuesSet]) => ({
      key,
      values: Array.from(valuesSet),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
