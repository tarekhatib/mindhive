const multer = require("multer");

const storage = multer.memoryStorage();

const path = require("path");

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimes.includes(file.mimetype) || !allowedExt.includes(ext)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }
});