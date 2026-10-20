function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

export function contactEmail({ name, email, message }) {
  const sender = name.trim();
  const body = message.trim();
  const safeName = escapeHtml(sender);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(body).replace(/\r\n|\r|\n/g, '<br>');

  return {
    subject: `New message from ${sender} · henjiman.com`,
    text: `New message from henjiman.com\n\nFrom: ${sender}\nEmail: ${email}\n\n${body}\n\nReply to this email to respond to ${sender}.`,
    html: `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#f3f1eb;color:#17211b;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f1eb;"><tr><td align="center" style="padding:32px 16px 48px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
        <tr><td style="padding:0 0 20px;font-size:14px;font-weight:700;letter-spacing:0.02em;color:#243e30;">henjiman<span style="color:#799259;">.</span></td></tr>
        <tr><td style="background:#ffffff;border:1px solid #d4d1c8;border-radius:16px;padding:36px 38px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#626b65;">New website message</p>
          <h1 style="margin:0 0 28px;font-size:30px;line-height:1.2;letter-spacing:-0.04em;color:#17211b;">A note from ${safeName}</h1>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #d4d1c8;border-bottom:1px solid #d4d1c8;">
            <tr><td style="padding:17px 0 7px;width:84px;vertical-align:top;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#626b65;">From</td><td style="padding:16px 0 7px;font-size:15px;line-height:1.5;color:#17211b;">${safeName}</td></tr>
            <tr><td style="padding:7px 0 17px;vertical-align:top;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#626b65;">Email</td><td style="padding:6px 0 17px;font-size:15px;line-height:1.5;word-break:break-word;"><a href="mailto:${safeEmail}" style="color:#426648;text-decoration:underline;">${safeEmail}</a></td></tr>
          </table>
          <p style="margin:28px 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#626b65;">Message</p>
          <p style="margin:0;font-size:16px;line-height:1.7;color:#17211b;overflow-wrap:anywhere;">${safeMessage}</p>
        </td></tr>
        <tr><td style="padding:20px 4px 0;font-size:13px;line-height:1.6;color:#626b65;">Reply to this email to write back to ${safeName}.</td></tr>
      </table>
    </td></tr></table>
  </body>
</html>`,
  };
}
