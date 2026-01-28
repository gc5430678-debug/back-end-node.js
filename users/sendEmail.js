const nodemailer = require("nodemailer");

const sendPinEmail = async (to, pin) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_SMTP_KEY,
    },
  });

  await transporter.sendMail({
    from: `"Auth App" <${process.env.BREVO_EMAIL}>`,
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
