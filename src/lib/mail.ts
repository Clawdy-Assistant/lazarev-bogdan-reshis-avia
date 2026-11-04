import nodemailer from 'nodemailer';

export async function sendCode(to: string, firstName: string, code: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') throw new Error('Gmail is not configured');
    console.log(`[dev] код для ${to}: ${code}`);
    return;
  }
  const transport = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } });
  await transport.sendMail({
    from: { name: 'Решись Авиа', address: user },
    to,
    subject: `${code} — код для входа в Решись Авиа`,
    text: `${firstName}, ваш код: ${code}\n\nОн действует 10 минут. Если вы не регистрировались в Решись Авиа, просто удалите это письмо.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:420px;color:#0c131d">
      <p style="font-size:16px">${escapeHtml(firstName)}, ваш код для входа в Решись Авиа:</p>
      <p style="font-size:36px;font-weight:700;letter-spacing:6px;color:#0a6cf2;margin:16px 0">${code}</p>
      <p style="font-size:14px;color:#566070">Он действует 10 минут. Если вы не регистрировались, просто удалите это письмо.</p>
    </div>`,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
