import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { config } from "./config";

interface Options {
  email: string;
  subject: string;
  textMessage: string;
}

export const sendEmail = async (options: Options) => {
  const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    auth: {
      user: config.emailUserName,
      pass: config.emailPassword,
    },
  });

  const mailOptions: MailOptions = {
    from: "Min Thant <marsjason485@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.textMessage,
  };

  await transporter.sendMail(mailOptions);
};
