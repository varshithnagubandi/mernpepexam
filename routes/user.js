const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserById, updateUserPassword } = require("../models/user");

const router = express.Router();

// Middleware to authenticate user using JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Route to update password
router.put("/update-password", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required" });
  }

  const user = findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const updated = updateUserPassword(userId, hashedPassword);

  if (updated) {
    res.status(200).json({ message: "Password updated successfully" });
  } else {
    res.status(500).json({ message: "Error updating password" });
  }
});

module.exports = router;
