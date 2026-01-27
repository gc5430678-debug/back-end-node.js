const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPinEmail = async (to, pin) => {
  await resend.emails.send({
    from: "Auth App <onboarding@resend.dev>",
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
