const nodemailer = require('nodemailer');

const sendEmails = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Ishaque Ahmed <hello_ishaque@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };

    // 3) Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmails;
