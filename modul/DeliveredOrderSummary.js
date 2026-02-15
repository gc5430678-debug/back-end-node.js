// حفظ ملخص الطلبات المسلّمة (سعر، كمية، اسم، منطقة، إجمالي)
const mongoose = require("mongoose");

const DeliveredOrderSummarySchema = new mongoose.Schema({
  delverEmail: { type: String, required: true },
  delverName: { type: String, default: "" },
  clientName: { type: String, required: true },
  clientPhone: { type: String, required: true },
  zone: { type: String, default: "" }, // المنطقة / الزون
  items: [
    {
      name: { type: String, default: "" },
      price: { type: Number, default: 0 },
      quantity: { type: Number, default: 0 },
      subtotal: { type: Number, default: 0 },
    },
  ],
  totalPrice: { type: Number, required: true },
  deliveredAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("DeliveredOrderSummary", DeliveredOrderSummarySchema);
