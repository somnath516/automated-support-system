const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ["User", "Operator", "Admin"],
    default: "User"
  }
});

module.exports = mongoose.model("User", UserSchema);

