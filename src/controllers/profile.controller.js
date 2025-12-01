const profileService = require("../services/profile.service");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const BUCKET = "profile-pictures";

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { first_name, last_name, username } = req.body;

    let imagePath = null;

    if (req.file) {
      
      const [old] = await db.query(
        "SELECT profile_image FROM users WHERE id = ?",
        [userId]
      );

      if (old[0]?.profile_image) {
        const oldPath = old[0].profile_image.split("/storage/v1/object/public/")[1];
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
      const mime = req.file.mimetype;
      const fileExt = mime.split("/")[1];

      const crypto = require("crypto");
      const randomName = crypto.randomBytes(16).toString("hex");
      const fileName = `users/${userId}/${randomName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

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
