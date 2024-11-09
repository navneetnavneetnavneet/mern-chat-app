const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors");

module.exports.homePage = catchAsyncErrors(async (req, res, next) => {
  res.json({ message: "route working !" });
});
