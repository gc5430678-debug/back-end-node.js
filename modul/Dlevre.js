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

  // ✅ بيانات قبول الطلب
  accepted: { type: Boolean, default: false },        // هل تم قبول الطلب
  deliveredBy: { type: String, default: null },       // اسم المندوب الذي قبل الطلب
  delverEmail: { type: String, default: null },       // إيميل المندوب
  delverLocation: {                                   // موقع المندوب عند قبول الطلب
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  acceptedAt: { type: Date, default: null }           // وقت قبول الطلب
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
