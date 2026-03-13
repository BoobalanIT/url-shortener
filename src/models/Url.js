const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      unique: true,       // Each short code must be unique
    },
    originalUrl: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // Links to the User model
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,         // Starts at 0
    },
    expiresAt: {
      type: Date,
      default: null,      // null = never expires
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Url", urlSchema);