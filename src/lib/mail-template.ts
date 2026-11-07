function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]!);
}

export function createVerificationEmail(firstName: string, code: string) {
  const name = escapeHtml(firstName);
  const safeCode = escapeHtml(code);
  return {
    subject: `${code} — код для входа в Решись Авиа`,
    text: `Здравствуйте, ${firstName}!\n\nВаш код подтверждения: ${code}\n\nОн действует 10 минут. Никому не сообщайте этот код.\n\nЕсли вы не запрашивали код, просто проигнорируйте это письмо.\n\nРешись Авиа · https://ddln.space`,
    html: `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Код подтверждения — Решись Авиа</title></head>
<body style="margin:0;padding:0;background-color:#f2f4f5;color:#0c131d;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Ваш код подтверждения: ${safeCode}. Он действует 10 минут.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f4f5;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-collapse:separate;border-spacing:0;border-radius:20px;overflow:hidden;">
<tr><td style="background-color:#0a6cf2;padding:24px 32px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td width="48" valign="middle"><img src="https://ddln.space/media/email-logo.png" width="40" height="40" alt="Решись Авиа" style="display:block;border:0;border-radius:10px;"></td><td valign="middle" style="font-size:20px;font-weight:700;letter-spacing:-0.4px;color:#ffffff;">Решись Авиа</td></tr></table>
</td></tr>
<tr><td style="background-color:#0a6cf2;"><img src="https://ddln.space/media/email-hero.jpg" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
<tr><td style="padding:36px 32px 12px;">
<p style="margin:0 0 12px;color:#0a6cf2;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;">Безопасный вход</p>
<h1 style="margin:0 0 20px;font-size:28px;line-height:34px;letter-spacing:-0.5px;color:#0c131d;">Ваш код подтверждения</h1>
<p style="margin:0 0 22px;font-size:16px;line-height:25px;color:#344054;">Здравствуйте, ${name}! Введите этот код на сайте, чтобы подтвердить адрес электронной почты.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#e3efff;border-radius:16px;"><tr><td align="center" style="padding:22px 16px;">
<div style="font-size:12px;line-height:18px;font-weight:700;letter-spacing:1px;color:#566070;text-transform:uppercase;">Код подтверждения</div>
<div style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:38px;line-height:48px;letter-spacing:8px;font-weight:700;color:#0a62dc;">${safeCode}</div>
</td></tr></table>
<p style="margin:20px 0 0;font-size:14px;line-height:22px;color:#566070;">Код действует <strong style="color:#0c131d;">10 минут</strong>. Никому его не сообщайте.</p>
</td></tr>
<tr><td style="padding:24px 32px 32px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #e1e5ea;"><tr><td style="padding-top:22px;font-size:13px;line-height:21px;color:#7d8796;">Если вы не запрашивали код, просто проигнорируйте это письмо.</td></tr></table></td></tr>
</table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;"><tr><td align="center" style="padding:24px 16px 0;color:#7d8796;font-size:12px;line-height:20px;">Решись Авиа · Сервис прогноза продаж авиабилетов<br><a href="https://ddln.space" style="color:#0a62dc;text-decoration:none;">ddln.space</a></td></tr></table>
</td></tr></table></body></html>`,
  };
}
