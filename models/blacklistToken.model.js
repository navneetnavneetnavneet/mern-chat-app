const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Toke is required !"],
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 86400,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("blacklistToken", blacklistSchema);
