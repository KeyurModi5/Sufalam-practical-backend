const { Product, Attribute } = require("../connection/connection");
const { Sequelize, Op } = require("sequelize");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, attributes } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is Required" });
    }
    if (!price) {
      return res.status(400).json({ error: "Price is Required" });
    }
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
// adjust based on your structure

exports.getProducts = async (req, res) => {
  try {
    const { name, startDate, endDate, sort, page, limit, ...filters } =
      req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const attributeIncludes = Object.entries(filters).map(([key, value]) => ({
      model: Attribute,
      as: "attributes",
      required: true,
      where: {
        key: key,
        value: value,
      },
    }));

    // Fetch with filtering, limit, offset
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: attributeIncludes.length
        ? attributeIncludes
        : [
            {
              model: Attribute,
              as: "attributes",
              required: false,
            },
          ],
      order: sort
        ? [["createdAt", sort.toUpperCase()]]
        : [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: offset,
      distinct: true,
    });

    res.json({
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      data: rows,
      message: "List fetched successfully",
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
