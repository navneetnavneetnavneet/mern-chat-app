const mongoose = require("mongoose");

// module.exports.connectDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("Database Connection Established");
//   } catch (error) {
//     console.log(error);
//   }
// };

module.exports.connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    console.log("Database Connection Established");
  } catch (error) {
    console.log(error);
  }
};
