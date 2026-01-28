const nodemailer = require("nodemailer");

const sendPinEmail = async (to, pin) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // 🔥 مهم بدل host
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // 🔥 يحل مشكلة Railway
    },
  });

  await transporter.sendMail({
    from: `"Auth App" <${process.env.EMAIL}>`,
    to,
    subject: "رمز التحقق",
    html: `
      <div style="text-align:center;font-family:Arial">
        <h2>رمز التحقق الخاص بك</h2>
        <h1>${pin}</h1>
        <p>الرمز صالح لمدة 10 دقائق</p>
      </div>
    `,
  });
};

module.exports = sendPinEmail;
