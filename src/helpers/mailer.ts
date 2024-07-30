import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';
import UserAuth from '@/models/userModel';
export const sendMail = async ({ email, emailType, userId }: any) => {
    try {

        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        const verifyEmail = `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
        or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
        </p>`
        
        if (emailType === "VERIFY") {
            await UserAuth.findByIdAndUpdate(userId,
                { verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000 })
        } else if (emailType === "RESET") {
            await UserAuth.findByIdAndUpdate(userId,
                { forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000 })
        }


        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS
            }
        });

        const mailOptions = {
            from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
            to: email, // list of receivers
            subject: emailType === 'VERIFY' ? "Verify Your Email" : "Reset Your Pasword",
            text: "Hello world?", // plain text body
            html: verifyEmail
        }
        

        const mailResponse = await transport.sendMail(mailOptions);
    } catch (error: any) {
        throw new Error(error.message);
        console.log(error);
    }
}