require("dotenv").config({
  path: "./.env",
});
const express = require("express");
const app = express();

// db connection
require("./config/db").connectDatabase();

// create server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
