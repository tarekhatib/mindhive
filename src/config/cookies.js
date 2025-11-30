const isProd = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: false,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: false,
  secure: true,
  sameSite: "none",
  path: "/",
};

module.exports = {
  accessCookieOptions,
  refreshCookieOptions,
};