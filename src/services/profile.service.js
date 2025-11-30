const db = require("../config/db");

const updateAll = async (userId, fields) => {
  const { first_name, last_name, username, profile_image } = fields;

  const query = `
    UPDATE users
    SET first_name = ?, last_name = ?, username = ?, 
        profile_image = COALESCE(?, profile_image)
    WHERE id = ?
  `;

  await db.query(query, [
    first_name,
    last_name,
    username,
    profile_image,
    userId
  ]);

  const [rows] = await db.query(
    "SELECT id, first_name, last_name, username, email, profile_image FROM users WHERE id = ?",
    [userId]
  );

  return rows[0];
};

const updateProfileImage = async (userId, imagePath) => {
  try {
    await db.query(
      `UPDATE users 
       SET profile_image = ?
       WHERE id = ?`,
      [imagePath, userId]
    );

    const [rows] = await db.query(
      "SELECT id, first_name, last_name, username, email, profile_image FROM users WHERE id = ?",
      [userId]
    );

    return rows[0];
  } catch (err) {
    console.error("updateProfileImage error:", err);
    throw { status: 500, message: "Image update failed" };
  }
};

module.exports = { updateAll, updateProfileImage };