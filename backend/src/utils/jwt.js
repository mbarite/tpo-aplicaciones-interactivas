const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      username: admin.username,
      role: "admin"
    },
    env.jwtSecret,
    {
      expiresIn: "8h"
    }
  );
}

module.exports = {
  signAdminToken
};
