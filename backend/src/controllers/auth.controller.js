const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendSuccess, sendError } = require("../utils/response");

// Helper: generate a JWT token for a user
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                    // Payload — what we store inside token
    process.env.JWT_SECRET,            // Secret key to sign the token
    { expiresIn: "7d" }                // Token expires in 7 days
  );
};

// --- REGISTER ---
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check all fields are provided
    if (!name || !email || !password) {
      return sendError(res, 400, "Please provide name, email and password");
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, "Email already registered");
    }

    // 3. Create user (password gets hashed automatically via pre-save hook)
    const user = await User.create({ name, email, password });

    // 4. Generate token and send response
    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Account created successfully", {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return sendError(res, 400, "Please provide email and password");
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 401, "Invalid email or password");
    }

    // 3. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password");
    }

    // 4. Generate token and respond
    const token = generateToken(user._id);

    return sendSuccess(res, 200, "Login successful", {
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { register, login };