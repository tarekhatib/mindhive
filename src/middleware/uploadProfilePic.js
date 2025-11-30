const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/profile_pics/");
  },
  filename: (req, file, cb) => {
    cb(null, req.user.id + "_pfp" + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  cb(null, allowed.includes(file.mimetype));
};

module.exports = multer({ storage, fileFilter });