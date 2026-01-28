import nodemailer from "nodemailer";
import { Config } from "./config";

export async function sendDigest(
  config: Config,
  payload: { subject: string; text: string; html: string }
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });
}