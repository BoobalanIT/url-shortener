const express = require("express");
const router = express.Router();
const {
  shortenUrl,
  getMyUrls,
  getUrlStats,
  updateUrl,
  deleteUrl,
} = require("../controllers/url.controller");
const { protect } = require("../middlewares/auth.middleware");

// All routes are protected
router.post("/shorten", protect, shortenUrl);       // Create
router.get("/my-urls", protect, getMyUrls);         // Get all my URLs
router.get("/:code/stats", protect, getUrlStats);   // Get stats
router.patch("/:code", protect, updateUrl);         // Update
router.delete("/:code", protect, deleteUrl);        // Delete

module.exports = router;
