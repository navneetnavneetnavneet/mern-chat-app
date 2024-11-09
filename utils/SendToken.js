module.exports.sendToken = (user, statusCode, res) => {
  const token = user.generatejwttoken();

  const options = {
    expire: new Date(
      Date.now() + 24 * 60 * 60 * 1000 + process.env.COOKIE_EXPIRE
    ),
    httpOnly: true,
    // secure: true,
    // sameSite: "None",
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token: token,
    _id: user._id,
    name: user.name,
    email: user.email,
    profileImage: user.profileImage,
  });
};
