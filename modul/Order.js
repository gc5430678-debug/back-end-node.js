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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
