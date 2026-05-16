import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./lib/logger.js";

const connectors = new ReplitConnectors();

function buildWinnerEmailRaw(opts: {
  to: string;
  toName: string;
  ticketNumber: string;
  giveawayName: string;
  prizeValue: string;
}): string {
  const { to, toName, ticketNumber, giveawayName, prizeValue } = opts;

  const subject = `🥃 Congratulations — You've Won the ${giveawayName}!`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're a Winner!</title>
</head>
<body style="margin:0;padding:0;background:#0d0a07;font-family:Georgia,serif;color:#e8d5b0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#1a1108;border:1px solid #3d2a0f;border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3d1a05,#1c0c03);padding:40px 48px;text-align:center;border-bottom:2px solid #ea9237;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.3em;color:#ea9237;text-transform:uppercase;">PrizePour · Official Draw Result</p>
              <h1 style="margin:0;font-size:36px;color:#ea9237;font-weight:normal;">Congratulations On Winning</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <p style="margin:0 0 24px;font-size:18px;line-height:1.6;color:#e8d5b0;">
                Dear ${toName},
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#c4a97a;">
                Congratulations! Your ticket has been selected as the winner of the official PrizePour draw.
              </p>

              <!-- Winner card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0a07;border:1px solid #ea9237;border-radius:4px;margin:32px 0;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.3em;color:#ea9237;text-transform:uppercase;">Winning Ticket</p>
                    <p style="margin:0 0 24px;font-family:'Courier New',monospace;font-size:48px;color:#ea9237;font-weight:bold;">${ticketNumber}</p>
                    <hr style="border:none;border-top:1px solid #3d2a0f;margin:0 0 24px;" />
                    <p style="margin:0 0 4px;font-size:14px;color:#c4a97a;font-family:Arial,sans-serif;letter-spacing:0.1em;text-transform:uppercase;">Prize</p>
                    <p style="margin:0 0 4px;font-size:22px;color:#e8d5b0;">${giveawayName}</p>
                    <p style="margin:0;font-size:14px;color:#ea9237;font-family:Arial,sans-serif;">${prizeValue}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#c4a97a;">
                Our team will be in touch within <strong style="color:#e8d5b0;">3–5 business days</strong> to arrange delivery of your prize. Please keep an eye on this email address for further instructions.
              </p>
              <p style="margin:0 0 32px;font-size:16px;line-height:1.7;color:#c4a97a;">
                If you have any questions, simply reply to this email.
              </p>

              <p style="margin:0;font-size:16px;color:#e8d5b0;">
                Sláinte,<br/>
                <strong>The PrizePour Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px;border-top:1px solid #3d2a0f;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#6b4f2a;line-height:1.6;">
                PrizePour · This email was sent to ${to} because your ticket was selected in a PrizePour draw.<br/>
                Please drink responsibly. 18+.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const boundary = `boundary_prizepour_${Date.now()}`;
  const rawParts = [
    `From: PrizePour Draws <me>`,
    `To: ${toName} <${to}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    `Congratulations ${toName}! Your ticket ${ticketNumber} has been selected as the winner of ${giveawayName} (${prizeValue}). Our team will be in touch within 3-5 business days to arrange delivery. Sláinte, The PrizePour Team`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
    ``,
    `--${boundary}--`,
  ];

  const rawEmail = rawParts.join("\r\n");
  return Buffer.from(rawEmail).toString("base64url");
}

export async function sendWinnerEmail(opts: {
  to: string;
  toName: string;
  ticketNumber: string;
  giveawayName: string;
  prizeValue: string;
}): Promise<void> {
  const raw = buildWinnerEmailRaw(opts);

  const response = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gmail send failed: ${response.status} ${body}`);
  }

  const result = await response.json() as { id: string };
  logger.info({ messageId: result.id, to: opts.to }, "Winner email sent via Gmail");
}
