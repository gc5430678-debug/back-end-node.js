const express = require("express");
const Order = require("../modul/Order");
const User = require("../modul/User"); // 🔹 تم إضافة هذا
const { sendOrderToExpo } = require("../users/delvere");

const router = express.Router();

// ================= SAVE ORDER =================
router.post("/create", async (req, res) => {
  try {
    const { email, phone, location, items, totalPrice, name } = req.body;

    if (!email || !phone || !location || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "بيانات الطلب ناقصة",
      });
    }

    let order = await Order.findOne({ email, phone });

    if (order) {
      if (name) order.name = name;

      items.forEach((newItem) => {
        const existingItem = order.items.find(
          (item) =>
            item.productId === newItem.productId &&
            item.image === newItem.image
        );

        if (existingItem) {
          existingItem.quantity = newItem.quantity;
        } else {
          order.items.push(newItem);
        }
      });

      order.totalPrice = totalPrice;
      await order.save();

      return res.json({
        success: true,
        message: "تم تحديث الطلب بدون أخطاء حساب",
      });
    }

    const newOrder = new Order({
      name,
      email,
      phone,
      location,
      items,
      totalPrice,
    });

    await newOrder.save();

    res.json({
      success: true,
      message: "تم حفظ الطلب بنجاح",
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "خطأ في السيرفر",
    });
  }
});

// ================= GET ALL ORDERS =================
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.json({
        success: false,
        message: "لا توجد طلبات في قاعدة البيانات",
        orders: [],
      });
    }

    res.json({
      success: true,
      message: "تم جلب جميع الطلبات بنجاح",
      orders,
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "خطأ في السيرفر أثناء جلب الطلبات",
    });
  }
});

// GET /api/order/delver/:orderId
router.get("/delver/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order || !order.delver) return res.json({ delver: null });
    const delver = await User.findOne({ email: order.delver });
    res.json({ delver });
  } catch (err) {
    console.log(err);
    res.json({ delver: null });
  }
});

module.exports = router;
