const db = require("../config/db");
const profileService = require("../services/profile.service");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");

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
      const buf = req.file.buffer;

      if (!buf || buf.length < 4) {
        return res.status(400).json({ message: "Invalid or empty file." });
      }

      const isJpeg =
        buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;

      const isPng =
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4E &&
        buf[3] === 0x47;

      const isWebp =
        buf[0] === 0x52 &&
        buf[1] === 0x49 &&
        buf[2] === 0x46 &&
        buf[3] === 0x46;

      if (!(isJpeg || isPng || isWebp)) {
        return res.status(400).json({ message: "Invalid image format." });
      }

      const [old] = await db.query(
        "SELECT profile_image FROM users WHERE id = ?",
        [userId]
      );

      if (old[0]?.profile_image) {
        const oldPath = old[0].profile_image.split(
          "/storage/v1/object/public/"
        )[1];

        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      const mime = req.file.mimetype;
      const fileExt = mime.split("/")[1];

      const randomName = crypto.randomBytes(16).toString("hex");
      const fileName = `users/${userId}/${randomName}.${fileExt}`;
     
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, req.file.buffer, {
          contentType: mime,
          upsert: false
        });

      if (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ message: "Upload failed." });
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
      profile_image: imagePath
    });

    return res.json({
      success: true,
      message: "Profile updated",
      user: updated
    });

  } catch (err) {
    console.error("Profile update error:", err);
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
    console.error("removeProfileImage error:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  updateProfile,
  removeProfileImage
};