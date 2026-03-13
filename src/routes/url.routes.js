const express = require("express");
const router = express.Router();
const { shortenUrl, getMyUrls } = require("../controllers/url.controller");
const { protect } = require("../middlewares/auth.middleware");

// All URL routes are protected — must be logged in
router.post("/shorten", protect, shortenUrl);
router.get("/my-urls", protect, getMyUrls);

module.exports = router;