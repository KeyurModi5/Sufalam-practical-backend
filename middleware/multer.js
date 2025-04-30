const multer = require("multer");
const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  fileFilter: (req, file, cb) => {
    if (!whitelist.includes(file.mimetype)) {
      return cb(new Error("file is not allowed"));
    }

    cb(null, true);
  },
});

module.exports = multer({ storage });
