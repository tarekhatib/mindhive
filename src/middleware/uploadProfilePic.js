const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter });
