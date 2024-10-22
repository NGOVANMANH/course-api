const User = require("../models/user.model");
const passwordHasher = require("../utils/password-hasher.util");
const jwtUtil = require("../utils/jwt.util");

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (role === null) role = "Student";
      if (role && role !== "Student" && role !== "Teacher") {
        return res.status(400).json({ message: "Invalid role" });
      }
      const hashedPassword = await passwordHasher.hashPassword(password);
      const newUser = new User({ name, password: hashedPassword, email, role });
      await newUser.save();
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error registering user", error });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await passwordHasher.comparePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwtUtil.generateToken({ userId: user._id });

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error });
    }
  },

  verifyToken: (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    jwtUtil.verifyToken(token, (err, decoded) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to authenticate token" });
      }

      req.userId = decoded.userId;
      next();
    });
  },
};

module.exports = authController;
