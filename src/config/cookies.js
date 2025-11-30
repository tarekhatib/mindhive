const isProd = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: false,
  secure: isProd,
  sameSite: "lax",
  path: "/",
};

module.exports = {
  accessCookieOptions,
  refreshCookieOptions,
};