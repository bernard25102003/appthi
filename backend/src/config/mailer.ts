import nodemailer from "nodemailer";
import { env } from "./env";

// Brevo SMTP credentials (dùng nodemailer để gửi qua Brevo SMTP)
// Hoặc dùng Brevo SDK (@getbrevo/brevo) nếu muốn template engine
export const mailer = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    // Brevo: login = Brevo account email, pass = SMTP key (khác API key)
    user: env.BREVO_SENDER_EMAIL,
    pass: env.BREVO_API_KEY,
  },
});

export const senderInfo = {
  name: env.BREVO_SENDER_NAME,
  email: env.BREVO_SENDER_EMAIL,
};
