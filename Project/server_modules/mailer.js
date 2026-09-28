require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

async function notifyContribution(data) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: "New website contribution",
        text: [
            "A new contribution is ready for review.",
            "",
            `Title: ${data.title}`,
            `Category: ${data.category}`,
            `Contributor email: ${data.email}`,
            `User ID: ${data.userId}`,
        ].join("\n"),
    });
}

module.exports = { notifyContribution };
