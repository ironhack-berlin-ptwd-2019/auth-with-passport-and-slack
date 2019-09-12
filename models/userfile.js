const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  password: String,
  slackID: String,
  image: String
});

const douglasAdams = mongoose.model("UserDB", userSchema);

module.exports = douglasAdams;