const profileService = require("../services/profile.service");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

const BUCKET = "Profile Picture Bucket";

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { first_name, last_name, username } = req.body;

    let imagePath = null;

    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `${userId}_pfp.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      imagePath = publicUrlData.publicUrl;
    }

    const updated = await profileService.updateAll(userId, {
      first_name,
      last_name,
      username,
      profile_image: imagePath,
    });

    return res.json({
      success: true,
      message: "Profile updated",
      user: updated,
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
      user: updated,
    });
  } catch (err) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  updateProfile,
  removeProfileImage,
};
