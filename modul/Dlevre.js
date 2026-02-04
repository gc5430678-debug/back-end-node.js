const mongoose = require("mongoose");

// 👇 Schema لكل منتج داخل المندوب
const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },

  // بيانات العميل لكل منتج
  clientName: { type: String },
  clientPhone: { type: String },
  clientLocation: { type: String },
  clientArea: { type: String },

  // بيانات قبول الطلب
  accepted: { type: Boolean, default: false },
  deliveredBy: { type: String, default: null },
  delverEmail: { type: String, default: null },
  delverLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  acceptedAt: { type: Date, default: null }
});

// 👇 Schema العملاء
const ClientSchema = new mongoose.Schema({
  clientName: { type: String },
  clientPhone: { type: String },
  clientLocation: { type: String },
});

// 👇 Schema المندوب
const DelverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // ✅ رقم هاتف المندوب
    phone: {
      type: String,
      required: true,
      unique: true
    },

    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },

    // كود التحقق
    pin: { type: String },
    pinExpires: { type: Date },

    products: { type: [ProductSchema], default: [] },
    clients: { type: [ClientSchema], default: [] },

    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      mapUrl: { type: String, default: "" },
      updatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Delver", DelverSchema);
