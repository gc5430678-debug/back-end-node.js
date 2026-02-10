const express = require("express");
const User = require("../modul/User");
const sendPinEmail = require("./sendEmail");

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email)
      return res.json({ success: false, message: "البيانات ناقصة" });

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const pinExpires = new Date(Date.now() + 10 * 60 * 1000);

    // تحقق إذا كان المستخدم موجودًا
    let user = await User.findOne({ email });

    if (user) {
      // إذا المستخدم موجود، لا نسجل جديد بل نرسل PIN جديد للتحقق
      user.pin = pin;
      user.pinExpires = pinExpires;
      user.verified = false;
    } else {
      // تسجيل مستخدم جديد بدون حذف الآخرين
      user = new User({ name, email, pin, pinExpires });
    }

    await user.save(); // حفظ البيانات

    console.log("📧 Sending PIN to:", user.email);
    console.log("🔢 PIN:", pin);

    await sendPinEmail(user.email, pin); // إرسال PIN

    res.json({ success: true, message: "تم إرسال رمز التحقق" });
  } catch (err) {
    console.log("❌ REGISTER ERROR:", err);
    res.json({ success: false, message: "فشل إرسال الإيميل" });
  }
});

// ================= VERIFY =================
router.post("/verify", async (req, res) => {
  const { email, pin } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.json({ success: false, message: "المستخدم غير موجود" });

  if (user.pin !== pin || user.pinExpires < new Date())
    return res.json({ success: false, message: "رمز غير صحيح أو منتهي" });

  user.verified = true;
  user.pin = null;
  user.pinExpires = null;
  await user.save();

  res.json({ success: true, message: "تم التحقق بنجاح" });
});

// ================= LOGOUT (DELETE USER) =================
router.post("/logout", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.json({ success: false, message: "البريد مطلوب" });

  try {
    await User.findOneAndDelete({ email });

    res.json({
      success: true,
      message: "تم تسجيل الخروج ومسح جميع البيانات للمستخدم المحدد",
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

module.exports = router;
