require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();

// create server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
