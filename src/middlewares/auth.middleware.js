const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/response");

const protect = async (req, res, next) => {
  try {
    let token;

    // JWT is sent in the header as: "Authorization: Bearer <token>"
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, 401, "Not authorized, no token");
    }

    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the logged-in user to the request object
    req.user = await User.findById(decoded.id).select("-password");

    next(); // Move to the next middleware/controller
  } catch (error) {
    return sendError(res, 401, "Not authorized, token failed");
  }
};

module.exports = { protect };