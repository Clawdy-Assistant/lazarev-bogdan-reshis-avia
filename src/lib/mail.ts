import nodemailer from 'nodemailer';
import { createVerificationEmail } from './mail-template';

export async function sendCode(to: string, firstName: string, code: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') throw new Error('Gmail is not configured');
    console.log(`[dev] код для ${to}: ${code}`);
    return;
  }
  const transport = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } });
  const message = createVerificationEmail(firstName, code);
  await transport.sendMail({
    from: { name: 'Решись Авиа', address: user },
    to,
    ...message,
  });
}
