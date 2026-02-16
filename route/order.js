const express = require("express");
const Order = require("../modul/Order");
const User = require("../modul/User");
const Product = require("../modul/djaj");
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

    // تحويل الطلب للمندوبين يستخدم items بصيغة مختلفة — نتأكد من التوافق
    const formatItem = (it) => ({
      productId: it._id || it.productId,
      title: it.title,
      image: it.image,
      price: it.price,
      quantity: it.quantity,
    });

    const newItems = items.map(formatItem);

    if (order) {
      if (name) order.name = name;

      // استعادة الكمية للمنتجات القديمة قبل التحديث
      for (const oldItem of order.items) {
        const pid = oldItem.productId || oldItem._id;
        if (pid) {
          const product = await Product.findById(pid);
          if (product) {
            product.quantityAvailable = (product.quantityAvailable || 0) + (oldItem.quantity || 0);
            await product.save();
          }
        }
      }

      order.items = newItems;
      order.totalPrice = totalPrice;
      await order.save();

      // تنقيص quantityAvailable للمنتجات الجديدة
      for (const it of newItems) {
        const pid = it.productId || it._id;
        if (!pid) continue;
        const product = await Product.findById(pid);
        if (!product) continue;
        const qty = Number(it.quantity) || 0;
        if (product.quantityAvailable < qty) {
          return res.status(400).json({
            success: false,
            message: `الكمية غير كافية للمنتج: ${product.title}`,
          });
        }
        product.quantityAvailable -= qty;
        await product.save();
      }

      return res.json({
        success: true,
        message: "تم تحديث الطلب بدون أخطاء حساب",
      });
    }

    // طلب جديد: التحقق ثم التنقيص
    for (const it of newItems) {
      const pid = it.productId || it._id;
      if (!pid) continue;
      const product = await Product.findById(pid);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `المنتج غير موجود`,
        });
      }
      const qty = Number(it.quantity) || 0;
      if ((product.quantityAvailable || 0) < qty) {
        return res.status(400).json({
          success: false,
          message: `الكمية غير كافية للمنتج: ${product.title}`,
        });
      }
    }

    for (const it of newItems) {
      const pid = it.productId || it._id;
      if (!pid) continue;
      const product = await Product.findById(pid);
      if (product) {
        product.quantityAvailable -= Number(it.quantity) || 0;
        await product.save();
      }
    }

    const newOrder = new Order({
      name,
      email,
      phone,
      location,
      items: newItems,
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
