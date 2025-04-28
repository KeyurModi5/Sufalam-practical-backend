require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./connection/connection");
const rootRouter = require("./routes/rootRouter");
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(rootRouter);

db.sequelize.sync({ alter: true }).then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
