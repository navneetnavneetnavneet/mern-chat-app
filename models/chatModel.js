const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      trim: true,
      unique: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "message" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("chat", chatSchema);