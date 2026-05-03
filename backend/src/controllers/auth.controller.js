const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.model");
const catchAsync = require("../utils/catchAsync");
const httpError = require("../utils/httpError");
const { signAdminToken } = require("../utils/jwt");

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw httpError(401, "Credenciales invalidas.");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

  if (!isPasswordValid) {
    throw httpError(401, "Credenciales invalidas.");
  }

  const token = signAdminToken(admin);

  res.json({
    message: "Login exitoso.",
    token,
    admin: {
      id: admin._id.toString(),
      username: admin.username
    }
  });
});

const me = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.user.sub).lean();

  if (!admin) {
    throw httpError(404, "Administrador no encontrado.");
  }

  res.json({
    id: admin._id.toString(),
    username: admin.username
  });
});

module.exports = {
  login,
  me
};
