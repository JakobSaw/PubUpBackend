const nodemailer = require("nodemailer");

const sendMail = async (subject, html) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.ionos.de",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_1,
                pass: process.env.MAIL_PW,
            },
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: `PubUp <${process.env.MAIL_1}>`,
            to: process.env.MAIL_2,
            subject,
            html,
        });
        return;
    } catch (err) {
        console.log("err :>> ", err);
        return;
    }
};

module.exports = sendMail;
