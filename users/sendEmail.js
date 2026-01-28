const axios = require("axios");

const sendPinEmail = async (to, pin) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Auth App",
          email: process.env.BREVO_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject: "رمز التحقق",
        htmlContent: `
          <div style="text-align:center;font-family:Arial">
            <h2>رمز التحقق الخاص بك</h2>
            <h1>${pin}</h1>
            <p>الرمز صالح لمدة 10 دقائق</p>
          </div>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("❌ Email API Error:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = sendPinEmail;
