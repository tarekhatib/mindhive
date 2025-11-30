const router = require("express").Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const profileController = require("../controllers/profile.controller");
const upload = require("../middleware/uploadProfilePic");

router.patch(
  "/api/profile",
  authenticateToken,
  upload.single("profile_image"),
  profileController.updateProfile
);

router.delete(
  "/api/profile/image",
  authenticateToken,
  profileController.removeProfileImage
);

module.exports = router;