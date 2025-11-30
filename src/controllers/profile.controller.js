const profileService = require("../services/profile.service");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { first_name, last_name, username } = req.body;
    const imagePath = req.file
      ? `/uploads/profile_pics/${req.file.filename}`
      : null;

    const updated = await profileService.updateAll(userId, {
      first_name,
      last_name,
      username,
      profile_image: imagePath,
    });

    return res.json({
      success: true,
      message: "Profile updated",
      user: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
const removeProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await profileService.updateProfileImage(userId, null);

    return res.json({
      success: true,
      message: "Profile photo removed",
      user: updated
    });

  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  updateProfile,
  removeProfileImage
};