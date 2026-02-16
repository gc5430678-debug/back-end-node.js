// modul/Order.js
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  items: [
    {
      productId: String,
      title: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  // بيانات المندوب المرسل إليه — تبقى حتى يتم التسليم
  delverEmail: { type: String, default: null },
  delverName: { type: String, default: null },
  delverPhone: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
