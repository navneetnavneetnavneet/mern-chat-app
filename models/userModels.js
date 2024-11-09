const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required !"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required !"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required !"],
      trim: true,
      select: false,
      maxLength: [
        15,
        "Password should not be exceed more than 15 characters !",
      ],
      minLength: [6, "Password must be atleast 6 characters !"],
    },
    profileImage: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2247726673.jpg",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  let salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
});

module.exports = mongoose.model("user", userSchema);
