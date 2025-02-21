const express = require("express");
const userController = require("../controllers/user.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const { body } = require("express-validator");
const upload = require("../middlewares/multer.middleware");

router.post(
  "/send-otp",
  [body("email").isEmail().withMessage("Invalid email !")],
  userController.sendOTP
);

router.post(
  "/signup",
  [
    body("fullName")
      .isLength({ min: 3 })
      .withMessage("Full name must be atleast 3 characters"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters"),
    body("password")
      .isLength({ max: 6 })
      .withMessage("Password should not be exceed more than 15 characters"),
    body("gender")
      .isIn(["male", "female", "other"])
      .withMessage("Gender must be eigther (male, female, other)"),
    body("dateOfBirth").notEmpty().withMessage("DOB is required"),
    body("otp").isLength({ min: 6 }).withMessage("OTP must be 6 characters"),
  ],
  userController.signUpUser
);

router.post(
  "/signin",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters"),
    body("password")
      .isLength({ max: 6 })
      .withMessage("Password should not be exceed more than 15 characters"),
  ],
  userController.signInUser
);

router.get(
  "/signout",
  authMiddleware.isAuthenticated,
  userController.signOutUser
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email !")],
  userController.forgotPassword
);

router.post(
  "/reset-password/:resetToken",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters"),
    body("password")
      .isLength({ max: 6 })
      .withMessage("Password should not be exceed more than 15 characters"),
  ],
  userController.resetPassword
);

router.get(
  "/current",
  authMiddleware.isAuthenticated,
  userController.loggedInUser
);

router.get("/alluser", authMiddleware.isAuthenticated, userController.allUser);

// include loggedInUser
router.get("/", authMiddleware.isAuthenticated, userController.fetchAllUser);

router.post("/edit", authMiddleware.isAuthenticated, userController.editUser);

router.get(
  "/delete",
  authMiddleware.isAuthenticated,
  userController.deleteUser
);

module.exports = router;
