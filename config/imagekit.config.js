var ImageKit = require("imagekit");

module.exports.initImageKit = () => {
  let imagekit = new ImageKit({
    publicKey: process.env.PUBLIC_KEY_IMAGEKIT,
    privateKey: process.env.PRIVATE_KEY_IMAGEKIT,
    urlEndpoint: process.env.URL_END_POINT_IMAGEKIT,
  });

  return imagekit;
};
