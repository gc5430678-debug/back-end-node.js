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
  clientArea: { type: String }, // إذا كنت تريد إضافة المنطقة
});

// 👇 Schema لكل عميل منفصل (Clients Array)
const ClientSchema = new mongoose.Schema({
  clientName: { type: String },
  clientPhone: { type: String },
  clientLocation: { type: String },
});

// 👇 Schema المندوب
const DelverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    pin: { type: String },
    pinExpires: { type: Date },

    // حفظ كل المنتجات المرسلة لكل مندوب
    products: { type: [ProductSchema], default: [] },

    // حفظ العملاء كمصفوفة منفصلة
    clients: { type: [ClientSchema], default: [] },

    // 🔹 الموقع الحالي للمندوب
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
