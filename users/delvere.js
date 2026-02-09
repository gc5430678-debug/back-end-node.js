const express = require("express");
const router = express.Router();
const User = require("../modul/Dlevre");
const sendPinEmail = require("./sendEmailDelvere");

// ================= FETCH (node-fetch) =================
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ================= GET ALL USERS =================
// ================= GET ALL USERS WITH PRODUCTS =================
router.get("/all", async (req, res) => {
  try {
    const users = await User.find(
      {},
      { name: 1, email: 1, phone: 1, verified: 1, products: 1 }
    ).sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "خطأ في جلب المستخدمين" });
  }
});

// ================= REGISTER =================
// ================= REGISTER =================
router.post("/re", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "البيانات ناقصة" });
    }

    // ❌ امنع التسجيل إذا الإيميل أو الهاتف موجود
    const exists = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "الإيميل أو الهاتف مسجل مسبقًا"
      });
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpires = new Date(Date.now() + 10 * 60 * 1000);

    await sendPinEmail(email, pin);

    const user = new User({
      name,
      email,
      phone,
      pin,
      pinExpires,
      verified: false
    });

    await user.save();

    res.json({ success: true, message: "تم إنشاء الحساب وإرسال رمز التحقق" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ================= VERIFY =================
router.post("/ve", async (req, res) => {
  const { email, pin } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ success: false, message: "المستخدم غير موجود" });
  if (user.pin !== pin || user.pinExpires < new Date())
    return res.json({ success: false, message: "رمز غير صحيح أو منتهي" });

  user.verified = true;
  user.pin = null;
  user.pinExpires = null;
  await user.save();

  res.json({ success: true, message: "تم التحقق بنجاح" });
});

// ================= LOGOUT =================
router.post("/log", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ success: false, message: "البريد مطلوب" });

  try {
    await User.findOneAndDelete({ email });
    res.json({ success: true, message: "تم تسجيل الخروج" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

/// ================= SEND PRODUCTS TO USER =================
router.post("/send-products", async (req, res) => {
  try {
    const {
      delverEmail, // ⭐ الإيميل المختار من القائمة
      email,       // (نتركه كما هو بدون حذف)
      products,
      clientName,
      clientPhone,
      clientLocation
    } = req.body;

    // ✅ تحقق من البيانات (كما هي)
    if (!delverEmail || !products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "البيانات ناقصة"
      });
    }

    // ✅ البحث فقط بالإيميل الذي تم اختياره
    const user = await User.findOne({
      email: delverEmail,
      verified: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "المندوب غير موثق"
      });
    }

    // ✅ إضافة بيانات العميل + ربط بالمندوب
    const productsWithClient = products.map(p => ({
      ...p,
      clientName,
      clientPhone,
  clientLocation,  // ✅ أضف هذا السطر
      delverEmail // ⭐ ربط الطلب بالمندوب المختار
    }));

    // ✅ إضافة الطلبات لهذا المندوب فقط
    user.products = [...user.products, ...productsWithClient];
    await user.save();

    res.json({
      success: true,
      message: "تم إضافة المنتجات للمندوب المحدد فقط",
      products: user.products
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "خطأ في السيرفر"
    });
  }
});

// ================= DELETE PRODUCTS =================
router.post("/delete-products", async (req, res) => {
  try {
    const { clientName, clientPhone, email } = req.body;

    if (!clientName || !clientPhone || !email) {
      return res.status(400).json({ success: false, message: "البيانات ناقصة" });
    }

    const user = await User.findOne({ email, verified: true });
    if (!user) return res.status(404).json({ success: false, message: "المندوب غير موجود أو غير موثق" });

    // تعديل المنتجات: حذف اسم وصورة كل منتج للعميل المحدد
    user.products = user.products.map(p => {
      if (p.clientName === clientName && p.clientPhone === clientPhone) {
        return {
          ...p,
          title: "محذوف",      // حذف اسم المنتج
          image: ""       // حذف صورة المنتج
        };
      }
      return p;
    });

    await user.save();

    // الحصول على المنتجات بعد حذف الاسماء والصور
    const remainingProducts = user.products.filter(
      p => p.clientName === clientName && p.clientPhone === clientPhone
    );

    // إظهار البيانات المطلوبة فقط
    const responseData = {
      clientName,
      clientPhone,
      clientLocation: remainingProducts[0]?.clientLocation || "",
      totalProducts: remainingProducts.length,
      totalPrice: remainingProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
    };

    res.json({ 
      success: true, 
      message: `تم حذف أسماء وصور المنتجات الخاصة بالعميل ${clientName}`,
      data: responseData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ================= UPDATE LOCATION =================
// مثال على المسار الصحيح
router.post("/update-location", async (req, res) => {
  try {
    const { email, latitude, longitude } = req.body;

    if (!email || latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: "البيانات ناقصة" });
    }

    const user = await User.findOne({ email, verified: true });
    if (!user) return res.status(404).json({ success: false, message: "المندوب غير موجود أو موثق" });

    user.location = {
      latitude,
      longitude,
      mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
      updatedAt: new Date()
    };

    await user.save();

    res.json({ success: true, message: "تم تحديث الموقع بنجاح", location: user.location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في تحديث الموقع" });
  }
});

// ================= ACCEPT ORDER =================
router.post("/accept-order", async (req, res) => {
  try {
    const { clientName, clientPhone, email, delverName, delverEmail, latitude, longitude } = req.body;

    if (!clientName || !clientPhone || !email || !delverName || !delverEmail) {
      return res.status(400).json({ success: false, message: "البيانات ناقصة" });
    }

    // جلب المستخدم (العميل) الذي يحتوي على الطلب
    const user = await User.findOne({ email, verified: true });
    if (!user) return res.status(404).json({ success: false, message: "المستخدم غير موجود أو غير موثق" });

    // تحديث كل المنتجات الخاصة بهذا العميل لتصبح مقبولة بواسطة المندوب
    user.products = user.products.map(p => {
      if (p.clientName === clientName && p.clientPhone === clientPhone) {
        return {
          ...p,
          accepted: true,
          deliveredBy: delverName,
          delverEmail,
          delverLocation: latitude && longitude ? { latitude, longitude } : p.delverLocation || null,
          acceptedAt: new Date()
        };
      }
      return p;
    });

    await user.save();

    // إرجاع بيانات المنتجات بعد القبول
    const acceptedProducts = user.products.filter(
      p => p.clientName === clientName && p.clientPhone === clientPhone
    );

    res.json({
      success: true,
      message: "✅ تم قبول الطلب من قبل المندوب",
      delverName,
      delverEmail,
      acceptedProducts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطأ في السيرفر أثناء قبول الطلب" });
  }
});

// ================= GET LATEST DELVER LOCATION =================
// ================= GET LATEST DELVER LOCATION =================
// ================= GET DELVER BY CLIENT =================
// ================= GET ACCEPTED ORDER DELVER =================
// ================= GET ACCEPTED DELVER INFO =================
router.get("/accepted-info", async (req, res) => {
  try {
    const { clientName, clientPhone, clientLocation } = req.query;

    if (!clientName || !clientPhone ||!clientLocation
    ) {
      return res.status(400).json({
        success: false,
        message: "clientName و clientPhone مطلوبين",
      });
    }

    // البحث عن المندوب الذي لديه منتج مقبول لهذا العميل
    const delver = await User.findOne({
      products: {
        $elemMatch: {
          clientName,
          clientPhone,
          clientLocation,
          accepted: true,
        },
      },
    });

    if (!delver) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مندوب لهذا الطلب",
      });
    }

    // جلب المنتج المقبول
    const acceptedProduct = delver.products.find(
      (p) =>
        p.clientName === clientName &&
        p.clientPhone === clientPhone &&
        p.accepted === true &&
        p.clientLocation === clientLocation,
    );

    if (!acceptedProduct) {
      return res.status(404).json({
        success: false,
        message: "الطلب غير مقبول بعد",
      });
    }

    // ✅ الرد النهائي
    res.json({
      success: true,

      // بيانات المندوب
      delver: {
        name: delver.name,
        email: delver.email,
        phone: delver.phone, // ✅ تمت الإضافة    
        verified: delver.verified,

        // الموقع الحالي (يتحدث كل فترة)
        currentLocation: delver.location,

        // الموقع وقت قبول الطلب
        acceptedLocation: acceptedProduct.delverLocation,
      },

      // بيانات الطلب
      order: {
        clientName,
        clientPhone,
        clientLocation,
        acceptedAt: acceptedProduct.acceptedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "خطأ في السيرفر",
    });
  }
});


module.exports = router;
