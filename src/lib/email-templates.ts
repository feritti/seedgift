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
      <p>SeedGift — Plant a financial seed for a child you love.</p>
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
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Thank you, ${giverName}!</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Your gift has been received and is ready to grow.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;font-size:15px;color:#1A1A1A;">
        <tr><td style="padding:6px 0;color:#6B7280;">Gift for</td><td style="padding:6px 0;text-align:right;font-weight:600;">${childName}'s ${eventName}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600;">${amount}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Invested in</td><td style="padding:6px 0;text-align:right;font-weight:600;">${fundName}</td></tr>
      </table>
    </div>
    <p style="font-size:14px;color:#6B7280;margin:0;">This gift will be invested and left to compound over time — a real head start for ${childName}'s future.</p>
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
    ? `<div style="background:#F5F5F0;border-radius:8px;padding:16px;margin:16px 0;font-style:italic;color:#1A1A1A;font-size:14px;">"${note}"</div>`
    : "";

  return layout(`
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">Great news, ${parentName}!</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">${giverName} just sent a gift for ${childName}.</p>
    <div style="background:#E6F9F0;border-radius:8px;padding:20px;text-align:center;margin-bottom:16px;">
      <p style="font-size:32px;font-weight:700;color:#00B964;margin:0;">${amount}</p>
      <p style="font-size:14px;color:#009B50;margin:4px 0 0;">from ${giverName}</p>
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
    <h1 style="font-size:22px;color:#1A1A1A;margin:0 0 8px;">A message from ${parentName}</h1>
    <p style="font-size:16px;color:#6B7280;margin:0 0 24px;">Regarding your gift for ${childName}:</p>
    <div style="background:#F5F5F0;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="font-size:15px;color:#1A1A1A;margin:0;line-height:1.6;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="font-size:14px;color:#6B7280;margin:0;">— ${parentName}, via SeedGift</p>
  `);
}
