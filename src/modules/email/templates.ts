/**
 * One shared branded layout for every outgoing email. Table-based, inline CSS, dark-mode
 * friendly (prefers-color-scheme), max-width 600px. Every builder below returns
 * { subject, html, text } so callers never hand-build markup themselves.
 */

const SITE_URL = 'https://techclues.vercel.app';
const API_URL = 'https://techclues-api.vercel.app';
const LOGO_URL = `${SITE_URL}/images/techclues-logo-white.png`;
const BRAND = '#0064ff';
const INK = '#0e0f31';
const COMPANY_NAME = 'TechClues';
/** Placeholder — replace with the real registered address (flagged in the handover report). */
const COMPANY_ADDRESS = 'TechClues, Birmingham, United Kingdom';

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Plain text preserves paragraphs; used both for the text/plain part and inside the quoted block. */
function toParagraphsHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

export type EmailLayoutOptions = {
  previewText: string;
  heading: string;
  /** Pre-escaped HTML body content (paragraphs, quoted blocks, etc). */
  bodyHtml: string;
  /** Plain-text equivalent of bodyHtml, already human-readable. */
  bodyText: string;
  cta?: { label: string; url: string };
  /** The one signature block, rendered once — raw multi-line text from Settings. */
  signatureText?: string;
  /** Shown only on newsletter mail, per the brief. */
  unsubscribeUrl?: string;
  reason: string;
};

export function renderEmail(opts: EmailLayoutOptions): { html: string; text: string } {
  const sig = opts.signatureText
    ? `<p style="margin:24px 0 0;color:${INK};font-size:14px;line-height:1.6;">${escapeHtml(opts.signatureText).replace(/\n/g, '<br/>')}</p>`
    : '';
  const sigText = opts.signatureText ? `\n\n${opts.signatureText}` : '';

  const ctaHtml = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
         <tr><td style="border-radius:999px;background:${BRAND};">
           <a href="${escapeHtml(opts.cta.url)}" style="display:inline-block;padding:14px 28px;color:#fff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;border-radius:999px;">${escapeHtml(opts.cta.label)}</a>
         </td></tr>
       </table>`
    : '';
  const ctaText = opts.cta ? `\n\n${opts.cta.label}: ${opts.cta.url}` : '';

  const unsubscribeHtml = opts.unsubscribeUrl
    ? ` · <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:${BRAND};">Unsubscribe</a>`
    : '';
  const unsubscribeText = opts.unsubscribeUrl ? `\nUnsubscribe: ${opts.unsubscribeUrl}` : '';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(opts.heading)}</title>
<style>
  :root { color-scheme: light dark; }
  @media (prefers-color-scheme: dark) {
    body, .tc-bg { background:#0b0c1f !important; }
    .tc-card { background:#15162e !important; }
    .tc-text { color:#e4e6f5 !important; }
    .tc-muted { color:#9a9cc0 !important; }
  }
</style>
</head>
<body class="tc-bg" style="margin:0;padding:0;background:#f4f5fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5fb;padding:32px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" class="tc-card" style="width:600px;max-width:92vw;background:#ffffff;border-radius:20px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,${INK},#0a1f6b);padding:28px 32px;">
      <img src="${LOGO_URL}" alt="${COMPANY_NAME}" width="150" style="display:block;border:0;" />
    </td>
  </tr>
  <tr>
    <td class="tc-text" style="padding:32px;color:${INK};font-size:15px;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:${INK};">${escapeHtml(opts.heading)}</h1>
      ${opts.bodyHtml}
      ${ctaHtml}
      ${sig}
    </td>
  </tr>
  <tr>
    <td class="tc-muted" style="padding:20px 32px;background:#f8f9fc;color:#6b6d8f;font-size:12.5px;line-height:1.6;">
      ${escapeHtml(COMPANY_NAME)} · ${escapeHtml(COMPANY_ADDRESS)}<br/>
      You're receiving this because ${escapeHtml(opts.reason)}.${unsubscribeHtml}
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `${opts.heading}\n\n${opts.bodyText}${ctaText}${sigText}\n\n—\n${COMPANY_NAME} · ${COMPANY_ADDRESS}\nYou're receiving this because ${opts.reason}.${unsubscribeText}`;

  return { html, text };
}

/** Admin notification: a new enquiry arrived. */
export function enquiryAdminEmail(
  e: { name: string; email: string; subject: string; message: string; source: string },
  siteUrl = SITE_URL,
) {
  return {
    subject: `New enquiry: ${e.subject}`,
    ...renderEmail({
      previewText: `${e.name} submitted a new ${e.source} enquiry`,
      heading: 'New enquiry',
      bodyHtml: `<p style="margin:0 0 16px;"><strong>${escapeHtml(e.name)}</strong> (${escapeHtml(e.email)}) submitted a new ${escapeHtml(e.source)} enquiry.</p>${toParagraphsHtml(e.message)}`,
      bodyText: `${e.name} (${e.email}) submitted a new ${e.source} enquiry.\n\n${e.message}`,
      cta: { label: 'Open in admin', url: `${siteUrl}/admin/inbox` },
      reason: "you're the TechClues admin notification recipient",
    }),
  };
}

/** Visitor auto-reply after submitting any public form. */
export function autoReplyEmail(
  firstName: string,
  bodyText: string,
  settings: { fromName: string; recipients: string[]; signature: string },
) {
  return {
    subject: 'Thanks for getting in touch — TechClues',
    ...renderEmail({
      previewText: `Thanks, ${firstName} — we'll be in touch soon`,
      heading: `Thanks, ${firstName}`,
      bodyHtml: toParagraphsHtml(bodyText),
      bodyText,
      signatureText: settings.signature,
      reason: 'you got in touch with us on our website',
    }),
  };
}

/** Admin's reply to an enquiry, with the visitor's original message quoted below. */
export function enquiryReplyEmail(
  firstName: string,
  replyBodyText: string,
  original: { name: string; message: string },
  settings: { fromName: string; recipients: string[]; signature: string },
) {
  const quotedHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr><td style="border-left:3px solid #e2e4f3;padding-left:16px;color:#6b6d8f;font-size:13.5px;line-height:1.6;">
      <p style="margin:0 0 6px;font-weight:600;">${escapeHtml(original.name)} wrote:</p>
      ${toParagraphsHtml(original.message)}
    </td></tr>
  </table>`;
  const quotedText = `\n\n— ${original.name} wrote: —\n${original.message}`;
  return {
    subject: '',
    ...renderEmail({
      previewText: replyBodyText.slice(0, 100),
      heading: `Hi ${firstName}`,
      bodyHtml: toParagraphsHtml(replyBodyText) + quotedHtml,
      bodyText: replyBodyText + quotedText,
      signatureText: settings.signature,
      reason: 'you contacted us through our website',
    }),
  };
}

/** Admin notification: booking failed to send confirmation, new booking, cancellation, etc. */
export function bookingAdminEmail(
  b: { name: string; email: string; start: Date; topic: string },
  kind: 'created' | 'cancelled',
  reason?: string,
  siteUrl = SITE_URL,
) {
  const when = b.start.toUTCString();
  const heading = kind === 'created' ? 'New booking' : 'Booking cancelled';
  const bodyText =
    kind === 'created'
      ? `${b.name} (${b.email}) booked a call for ${when}.\nTopic: ${b.topic}`
      : `${b.name}'s call for ${when} was cancelled.${reason ? ` Reason: ${reason}` : ''}`;
  return {
    subject:
      kind === 'created' ? `New booking: ${b.name} — ${when}` : `Booking cancelled: ${b.name}`,
    ...renderEmail({
      previewText: bodyText.slice(0, 100),
      heading,
      bodyHtml: toParagraphsHtml(bodyText),
      bodyText,
      cta: { label: 'Open in admin', url: `${siteUrl}/admin/bookings` },
      reason: "you're the TechClues admin notification recipient",
    }),
  };
}

/** Visitor-facing booking confirmation / reschedule / cancellation. */
export function bookingVisitorEmail(
  b: { name: string; start: Date; meetingLink?: string },
  kind: 'confirmed' | 'rescheduled' | 'cancelled',
  settings: { fromName: string; recipients: string[]; signature: string },
  reason?: string,
) {
  const when = b.start.toUTCString();
  const firstName = b.name.split(' ')[0];
  const heading =
    kind === 'confirmed'
      ? 'Your call is confirmed'
      : kind === 'rescheduled'
        ? 'Your call has been rescheduled'
        : 'Your call has been cancelled';
  const bodyText =
    kind === 'confirmed'
      ? `Your call is confirmed for ${when} (UK time).`
      : kind === 'rescheduled'
        ? `Your call has been moved to ${when} (UK time).`
        : `Your call for ${when} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`;
  return {
    subject:
      kind === 'confirmed'
        ? 'Your call with TechClues is confirmed'
        : kind === 'rescheduled'
          ? 'Your TechClues call has been rescheduled'
          : 'Your TechClues call has been cancelled',
    ...renderEmail({
      previewText: bodyText,
      heading,
      bodyHtml: toParagraphsHtml(bodyText),
      bodyText,
      cta:
        kind !== 'cancelled' && b.meetingLink
          ? { label: 'Join the call', url: b.meetingLink }
          : undefined,
      signatureText: settings.signature,
      reason: `you booked a call with us${firstName ? ` as ${firstName}` : ''}`,
    }),
  };
}

/** Newsletter welcome email, sent to the subscriber themselves. */
export function newsletterWelcomeEmail(
  email: string,
  unsubscribeToken: string,
  settings: { fromName: string; recipients: string[]; signature: string },
) {
  const bodyText =
    "Thanks for subscribing to the TechClues newsletter. We'll send you occasional updates — no spam, unsubscribe any time.";
  return {
    subject: "You're subscribed to the TechClues newsletter",
    ...renderEmail({
      previewText: bodyText,
      heading: 'Welcome aboard',
      bodyHtml: toParagraphsHtml(bodyText),
      bodyText,
      signatureText: settings.signature,
      unsubscribeUrl: `${API_URL}/api/public/unsubscribe?token=${unsubscribeToken}`,
      reason: `you subscribed to our newsletter with ${email}`,
    }),
  };
}

/** Newsletter unsubscribe confirmation. */
export function newsletterUnsubscribeEmail(
  email: string,
  settings: { fromName: string; recipients: string[]; signature: string },
) {
  const bodyText =
    "You've been unsubscribed from the TechClues newsletter. You won't receive any more newsletter emails from us.";
  return {
    subject: "You're unsubscribed from the TechClues newsletter",
    ...renderEmail({
      previewText: bodyText,
      heading: "You're unsubscribed",
      bodyHtml: toParagraphsHtml(bodyText),
      bodyText,
      signatureText: settings.signature,
      reason: `you unsubscribed ${email} from our newsletter`,
    }),
  };
}

/** Admin notification: new newsletter subscriber(s). */
export function subscriberAdminEmail(summary: string, siteUrl = SITE_URL) {
  return {
    subject: 'New newsletter subscriber',
    ...renderEmail({
      previewText: summary,
      heading: 'New subscriber',
      bodyHtml: toParagraphsHtml(summary),
      bodyText: summary,
      cta: { label: 'Open in admin', url: `${siteUrl}/admin/newsletter` },
      reason: "you're the TechClues admin notification recipient",
    }),
  };
}
