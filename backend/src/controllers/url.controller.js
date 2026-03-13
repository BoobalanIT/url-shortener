const { nanoid } = require("nanoid");
const Url = require("../models/Url");
const { sendSuccess, sendError } = require("../utils/response");

// --- SHORTEN URL ---
const shortenUrl = async (req, res) => {
  try {
    const { originalUrl, shortCode, expiresAt } = req.body;

    if (!originalUrl || !shortCode) {
      return sendError(res, 400, "Please provide both originalUrl and shortCode");
    }

    // Validate shortCode — only letters, numbers, hyphens
    const isValid = /^[a-zA-Z0-9-]+$/.test(shortCode);
    if (!isValid) {
      return sendError(res, 400, "shortCode can only contain letters, numbers, and hyphens");
    }

    // Check if shortCode already taken
    const existing = await Url.findOne({ shortCode });
    if (existing) {
      return sendError(res, 400, `"${shortCode}" is already taken, try another`);
    }

    // Validate expiresAt date if provided
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return sendError(res, 400, "Expiry date must be in the future");
    }

    const url = await Url.create({
      shortCode,
      originalUrl,
      createdBy: req.user._id,
      expiresAt: expiresAt || null,   // null = never expires
    });

    return sendSuccess(res, 201, "Short URL created", {
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      originalUrl,
      expiresAt: url.expiresAt,
      clicks: 0,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- GET MY URLs ---
const getMyUrls = async (req, res) => {
  try {
    const urls = await Url.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })  // newest first
      .select("-createdBy");    // hide createdBy field in response

    return sendSuccess(res, 200, "Your URLs", { urls });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- GET SINGLE URL STATS ---
const getUrlStats = async (req, res) => {
  try {
    const url = await Url.findOne({
      shortCode: req.params.code,
      createdBy: req.user._id,    // only owner can see stats
    });

    if (!url) {
      return sendError(res, 404, "URL not found");
    }

    // Check if expired
    const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

    return sendSuccess(res, 200, "URL Stats", {
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      isExpired,
      createdAt: url.createdAt,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- UPDATE URL ---
const updateUrl = async (req, res) => {
  try {
    const { originalUrl, expiresAt, shortCode } = req.body;  // ← add shortCode

    if (!originalUrl && !expiresAt && !shortCode) {
      return sendError(res, 400, "Please provide at least one field to update");
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return sendError(res, 400, "Expiry date must be in the future");
    }

    // Find URL and check ownership
    const url = await Url.findOne({
      shortCode: req.params.code,
      createdBy: req.user._id,
    });

    if (!url) {
      return sendError(res, 404, "URL not found or not authorized");
    }

    // Check if new shortCode is already taken by someone else
    if (shortCode && shortCode !== req.params.code) {
      const existing = await Url.findOne({ shortCode });
      if (existing) {
        return sendError(res, 400, `"${shortCode}" is already taken, try another`);
      }
      url.shortCode = shortCode;  // ← update shortCode
    }

    if (originalUrl) url.originalUrl = originalUrl;
    if (expiresAt) url.expiresAt = expiresAt;

    await url.save();

    return sendSuccess(res, 200, "URL updated successfully", {
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt,
      clicks: url.clicks,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- DELETE URL ---
const deleteUrl = async (req, res) => {
  try {
    // Find URL and check ownership
    const url = await Url.findOne({
      shortCode: req.params.code,
      createdBy: req.user._id,    // only owner can delete
    });

    if (!url) {
      return sendError(res, 404, "URL not found or not authorized");
    }

    await url.deleteOne();

    return sendSuccess(res, 200, "URL deleted successfully", {
      shortCode: req.params.code,
    });

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// --- REDIRECT ---
const redirectUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });

    if (!url) {
      return sendError(res, 404, "Short URL not found");
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return sendError(res, 410, "This short URL has expired");
    }

    // Increment click count
    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  shortenUrl,
  getMyUrls,
  getUrlStats,
  updateUrl,
  deleteUrl,
  redirectUrl,
};