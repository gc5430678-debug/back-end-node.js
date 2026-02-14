const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,        // ✅ رقم الهاتف
  location: { type: mongoose.Schema.Types.Mixed }, // ✅ نص "lat,lng" للعميل أو { latitude, longitude } للمندوب
  pin: String,
  pinExpires: Date,
  verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("User", UserSchema);
