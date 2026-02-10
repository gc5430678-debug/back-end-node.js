const express = require("express");
const User = require("../modul/User");

const router = express.Router();

// ================= حفظ الهاتف والموقع =================
router.post("/save-info", async (req, res) => {
  try {
    const { email, phone, location } = req.body;

    if (!email || !phone || !location) {
      return res.json({ success: false, message: "البيانات ناقصة" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "المستخدم غير موجود" });
    }

    if (!user.verified) {
      return res.json({ success: false, message: "الحساب غير موثّق" });
    }

    user.phone = phone;
    user.location = location;

    await user.save();

    res.json({ success: true, message: "تم حفظ المعلومات بنجاح" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});

// ================= جلب موقع الزبون =================
router.post("/get-location", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "الإيميل مطلوب"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "المستخدم غير موجود"
      });
    }

    if (!user.location) {
      return res.json({
        success: false,
        message: "لا يوجد موقع مسجل"
      });
    }

    res.json({
      success: true,
      location: user.location,
      phone: user.phone,
      name: user.name
    });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: "خطأ في السيرفر"
    });
  }
});
// ================= جلب كل مواقع الزبائن =================
router.get("/all-locations", async (req, res) => {
  try {
    const users = await User.find({ verified: true }, "name email location phone");
    const locations = users
      .filter(u => u.location) // فقط المستخدمين الذين لديهم موقع
      .map(u => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        location: u.location
      }));
    res.json({ success: true, users: locations });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "خطأ في السيرفر" });
  }
});


module.exports = router;
