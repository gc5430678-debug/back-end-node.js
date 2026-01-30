const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Product = require("./modul/djaj");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

// ================= multer =================
const storage = multer.memoryStorage(); // نخزن الصورة بالذاكرة فقط
const upload = multer({ storage });

// ================= ImageBB =================
const IMGBB_KEY = "db8f21522ae2d9f129a78346da6429da";
const IMGBB_URL = "https://api.imgbb.com/1/upload";

// =================================
// GET جميع المنتجات أو حسب الفئة
// =================================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// =================================
// POST إضافة منتج جديد + كمية
// =================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    let imageUrl = "";
    if (req.file) {
      const formData = new FormData();
      formData.append("key", IMGBB_KEY);
      formData.append("image", req.file.buffer.toString("base64"));

      const response = await axios.post(IMGBB_URL, formData, {
        headers: formData.getHeaders(),
      });
      imageUrl = response.data.data.url;
    }

    const product = new Product({
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      quantityAvailable: req.body.quantityAvailable || 0,
      image: imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// =================================
// GET منتج بالـ id
// =================================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================
// PUT تحديث منتج + كمية
// =================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.title = req.body.title || product.title;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;

    if (req.body.quantityAvailable !== undefined) {
      product.quantityAvailable = req.body.quantityAvailable;
    }

    if (req.file) {
      const formData = new FormData();
      formData.append("key", IMGBB_KEY);
      formData.append("image", req.file.buffer.toString("base64"));

      const response = await axios.post(IMGBB_URL, formData, {
        headers: formData.getHeaders(),
      });
      product.image = response.data.data.url;
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

// =================================
// DELETE منتج
// =================================
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // الصور على ImageBB، لا يمكن حذفها من API المجاني
    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================
// POST إنشاء طلب (تنقيص الكمية)
// =================================
router.post("/order/create", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "الطلبات فارغة" });
    }

    for (const item of items) {
      const product = await Product.findById(item._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `المنتج ${item._id} غير موجود`,
        });
      }

      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `الكمية غير كافية للمنتج ${product.title}`,
        });
      }
    }

    for (const item of items) {
      const product = await Product.findById(item._id);
      product.quantityAvailable -= item.quantity;
      await product.save();
    }

    res.json({ success: true, message: "تم إرسال الطلب بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في السيرفر" });
  }
});

// =================================
// Validation Joi
// =================================
function validateProduct(obj) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    price: Joi.number(),
    category: Joi.string().valid(
      "meat",
      "chicken",
      "drinks",
      "Offers",
      "waters"
    ),
    quantityAvailable: Joi.number().integer().min(0),
    image: Joi.string(),
  });

  return schema.validate(obj);
}

module.exports = router;
