/** Escape HTML special characters to prevent XSS in emails */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:700;color:#1A1A1A;">🌱 SeedGift</span>
    </div>
    <div style="background:#FFFFFF;border-radius:12px;padding:32px;border:1px solid #F0F0EC;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:32px;font-size:13px;color:#6B7280;">
      <p>SeedGift — Plant a financial seed for the child you love.</p>
      <p><a href="https://www.seedgift.xyz" style="color:#00B964;text-decoration:none;">www.seedgift.xyz</a></p>
    </div>
  </div>
</body>
</html>`;
}

export function giftReceiptEmail({
  giverName,
  childName,
  eventName,
  amount,
  fundName,
}: {
  giverName: string;
  childName: string;
  eventName: string;
  amount: string;
  fundName: string;
}): string {
  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Thank you, ${esc(giverName)}!</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Your gift has been received and is ready to grow.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;font-size:15px;color:#1A1A1A;">
        <tr><td style="padding:6px 0;color:#6B7280;">Gift for</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(childName)}'s ${esc(eventName)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(amount)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Invested in</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(fundName)}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#6B7280;margin:0;">This gift will be invested and left to compound over time — a real head start for ${esc(childName)}'s future.</p>
  `);
}

export function newGiftNotificationEmail({
  parentName,
  giverName,
  childName,
  amount,
  note,
}: {
  parentName: string;
  giverName: string;
  childName: string;
  amount: string;
  note: string | null;
}): string {
  const noteHtml = note
    ? `<div style="background:#F5F5F0;border-radius:8px;padding:16px;margin:16px 0;font-style:italic;color:#1A1A1A;font-size:14px;">"${esc(note)}"</div>`
    : "";

  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Great news, ${esc(parentName)}!</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">${esc(giverName)} just sent a gift for ${esc(childName)}.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px;">
      <p style="font-size:32px;font-weight:700;color:#00B964;margin:0;">${esc(amount)}</p>
      <p style="font-size:14px;color:#009B50;margin:4px 0 0;">from ${esc(giverName)}</p>
    </div>
    ${noteHtml}
    <p style="font-size:14px;color:#6B7280;margin:16px 0 0;">
      <a href="https://www.seedgift.xyz/dashboard" style="color:#00B964;text-decoration:none;font-weight:600;">View your dashboard →</a>
    </p>
  `);
}

export function thankYouEmail({
  giverName,
  childName,
  parentName,
  message,
}: {
  giverName: string;
  childName: string;
  parentName: string;
  message: string;
}): string {
  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">A message from ${esc(parentName)}</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Regarding your gift for ${esc(childName)}:</p>
    <div style="background:#F5F5F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="font-size:15px;color:#1A1A1A;margin:0;line-height:1.6;white-space:pre-wrap;">${esc(message)}</p>
    </div>
    <p style="font-size:14px;color:#6B7280;margin:0;">— ${esc(parentName)}, via SeedGift</p>
  `);
}

export function magicLinkEmail({ url }: { url: string }): string {
  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Sign in to SeedGift</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Click the button below to securely sign in. This link expires in 10 minutes.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}" style="display:inline-block;background:#00B964;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 40px;border-radius:9999px;text-decoration:none;">Sign in to SeedGift</a>
    </div>
    <p style="font-size:13px;color:#6B7280;margin:0;">If you didn&apos;t request this email, you can safely ignore it.</p>
    <p style="font-size:12px;color:#9CA3AF;margin:16px 0 0;word-break:break-all;">Or copy this link: ${url}</p>
  `);
}

export function sentGiftReceiptEmail({
  giverName,
  childName,
  occasion,
  amount,
  fundName,
  recipientEmail,
  shareUrl,
  projectedValue,
}: {
  giverName: string;
  childName: string;
  occasion: string;
  amount: string;
  fundName: string;
  recipientEmail: string;
  shareUrl: string;
  projectedValue: string;
}): string {
  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Your SeedGift is on its way, ${esc(giverName)}!</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">We've notified ${esc(recipientEmail)} about your gift for ${esc(childName)}.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;font-size:15px;color:#1A1A1A;">
        <tr><td style="padding:6px 0;color:#6B7280;">Gift for</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(childName)}'s ${esc(occasion)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(amount)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Invested in</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(fundName)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Sent to</td><td style="padding:6px 0;text-align:right;font-weight:600;">${esc(recipientEmail)}</td></tr>
      </table>
    </div>
    <p style="font-size:15px;color:#1A1A1A;margin:0 0 8px;font-weight:600;">Projected value in 18 years</p>
    <p style="font-size:28px;color:#00B964;font-weight:700;margin:0 0 24px;">${esc(projectedValue)}</p>
    <p style="font-size:14px;color:#6B7280;margin:0 0 16px;">You can also share the gift directly with a link:</p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${shareUrl}" style="display:inline-block;background:#00B964;color:#FFFFFF;font-size:15px;font-weight:600;padding:12px 28px;border-radius:9999px;text-decoration:none;">View the gift →</a>
    </div>
    <p style="font-size:13px;color:#9CA3AF;margin:0;word-break:break-all;">${shareUrl}</p>
  `);
}

export function sentGiftNotificationEmail({
  giverName,
  childName,
  occasion,
  amount,
  fundName,
  message,
  shareUrl,
  projectedValue,
}: {
  giverName: string;
  childName: string;
  occasion: string;
  amount: string;
  fundName: string;
  message: string | null;
  shareUrl: string;
  projectedValue: string;
}): string {
  const messageHtml = message
    ? `<div style="background:#F5F5F0;border-radius:8px;padding:16px;margin:16px 0;font-style:italic;color:#1A1A1A;font-size:15px;line-height:1.5;white-space:pre-wrap;">"${esc(message)}"<p style="font-style:normal;font-size:13px;color:#6B7280;margin:8px 0 0;">— ${esc(giverName)}</p></div>`
    : "";

  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">A gift for ${esc(childName)}'s ${esc(occasion)} 🌱</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">${esc(giverName)} didn't send a toy. They sent something that will grow with ${esc(childName)}.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:24px;text-align:center;margin-bottom:16px;">
      <p style="font-size:14px;color:#009B50;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.05em;">Gift Amount</p>
      <p style="font-size:36px;font-weight:700;color:#00B964;margin:0;">${esc(amount)}</p>
      <p style="font-size:14px;color:#009B50;margin:8px 0 0;">Invested in ${esc(fundName)}</p>
    </div>
    ${messageHtml}
    <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:16px 0 24px;">
      <p style="font-size:14px;color:#6B7280;margin:0 0 4px;">Projected value in 18 years</p>
      <p style="font-size:28px;color:#1A1A1A;font-weight:700;margin:0;">${esc(projectedValue)}</p>
      <p style="font-size:12px;color:#9CA3AF;margin:6px 0 0;">Based on the fund's historical average return. Not guaranteed.</p>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${shareUrl}" style="display:inline-block;background:#00B964;color:#FFFFFF;font-size:16px;font-weight:600;padding:14px 40px;border-radius:9999px;text-decoration:none;">View your gift →</a>
    </div>
    <div style="background:#F5F5F0;border-radius:8px;padding:16px;">
      <p style="font-size:13px;color:#6B7280;margin:0;"><strong style="color:#1A1A1A;">What's next?</strong> We'll email you soon with instructions to claim these funds and set up the investment. In the meantime, you can view and share the gift using the link above.</p>
    </div>
  `);
}

export function contactFormEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">New Contact Form Submission</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Someone reached out via the SeedGift contact form.</p>
    <div style="background:#F5F5F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;font-size:15px;color:#1A1A1A;">
        <tr><td style="padding:6px 0;color:#6B7280;vertical-align:top;width:80px;">From</td><td style="padding:6px 0;font-weight:600;">${esc(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;vertical-align:top;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(email)}" style="color:#00B964;text-decoration:none;">${esc(email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;vertical-align:top;">Subject</td><td style="padding:6px 0;">${esc(subject)}</td></tr>
      </table>
    </div>
    <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:8px;padding:20px;">
      <p style="font-size:15px;color:#1A1A1A;margin:0;line-height:1.6;white-space:pre-wrap;">${esc(message)}</p>
    </div>
    <p style="font-size:13px;color:#6B7280;margin:16px 0 0;">Reply directly to this email to respond to ${esc(name)}.</p>
  `);
}
