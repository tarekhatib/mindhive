const router = require("express").Router();
const { authenticateToken } = require("../middleware/auth.middleware");
const profileController = require("../controllers/profile.controller");
const upload = require("../middleware/uploadProfilePic");

/**
 * @swagger
 * tags:
 *   name: Profile
 */

/**
 * @swagger
 * /profile/upload:
 *   post:
 *     summary: Upload profile picture
 *     tags: [Profile]
 *     responses:
 *       200: { description: Image uploaded }
 */

/**
 * @swagger
 * /profile/update:
 *   patch:
 *     summary: Update profile info
 *     tags: [Profile]
 */

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
