// ------------------------
// 1️⃣ استدعاء المكتبات
// ------------------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// ------------------------
// 2️⃣ استدعاء Routes
// ------------------------
const productRoute = require("./route/product");
const home = require("./home/home");
const allcatgores = require("./allcatgores");
const authRoutes = require("./users/auth");
const locationRoutes = require("./users/location");
const orderRoutes = require("./route/order");
const delvreRoutes = require("./users/delvere");

// ------------------------
// 3️⃣ إنشاء التطبيق
// ------------------------
const app = express();

// ------------------------
// 4️⃣ Middlewares
// ------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// 5️⃣ إعداد الملفات الثابتة
// ------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uplodhome", express.static(path.join(__dirname, "uplodhome")));

// ------------------------
// 6️⃣ Routes
// ------------------------
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoute);
app.use("/api/all", allcatgores);
app.use("/api/home", home);
app.use("/api/user", locationRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/delver", delvreRoutes);

// Route أساسي لتأكيد تشغيل السيرفر
app.get("/", (req, res) => res.send("Server is running"));

// ------------------------
// 7️⃣ اتصال MongoDB
// ------------------------
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return; // لمنع الاتصال المزدوج
    await mongoose.connect("mongodb://mongo:SkpnKEMKZIfdYcxUcWBIzdpytXDKccHd@mongodb.railway.internal:27017");
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
    process.exit(1); // إذا فشل الاتصال، يوقف السيرفر
  }
};
connectDB();

// ------------------------
// 8️⃣ تشغيل السيرفر على Railway
// ------------------------
const PORT = process.env.PORT ||  8080;

async function bootstrap() {
  await app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

bootstrap();
