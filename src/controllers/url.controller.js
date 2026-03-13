const { nanoid } = require("nanoid");
const Url = require("../models/Url");
const { sendSuccess, sendError } = require("../utils/response");

// --- SHORTEN URL ---
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, shortCode } = req.body;

    // 1. Check both fields are provided
    if (!originalUrl || !shortCode) {
      return sendError(res, 400, "Please provide both originalUrl and shortCode");
    }

    // 2. Validate shortCode — only letters, numbers, hyphens allowed
    const isValid = /^[a-zA-Z0-9-]+$/.test(shortCode);
    if (!isValid) {
      return sendError(res, 400, "shortCode can only contain letters, numbers, and hyphens");
    }

    // 3. Check if shortCode is already taken
    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return sendError(res, 400, `"${shortCode}" is already taken, try another`);
    }

    // 4. Save to DB
    const url = await Url.create({
      shortCode,
      originalUrl,
      createdBy: req.user._id,
    });

    return sendSuccess(res, 201, "Short URL created", {
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      originalUrl,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
// --- GET MY URLs ---
const getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 }); // Newest first

    return sendSuccess(res, 200, "Your URLs", { urls });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- REDIRECT ---
// This lives in app.js as a top-level route: GET /:code
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;

    const url = await Url.findOne({ shortCode: code });

    if (!url) {
      return sendError(res, 404, "Short URL not found");
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return sendError(res, 410, "This short URL has expired");
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    // Redirect to original URL
    return res.redirect(url.originalUrl);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { shortenUrl, getMyUrls, redirectUrl };