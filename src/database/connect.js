const mongoose = require("mongoose");

// const uri = "mongod://localhost:27017/course-api-data";
const uri =
  process.env.NODE_ENV === "production"
    ? process.env.MONGO_URI
    : "mongodb://localhost:27017/course-api-data";

console.log(uri);

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

module.exports = mongoose;
