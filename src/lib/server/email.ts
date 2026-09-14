import "server-only";
import { Resend } from "resend";
import { SITE } from "@/lib/site";
import { SERVICE_TYPE_LABELS, URGENCY_LABELS, type InquiryFields } from "@/lib/inquirySchema";
import { bodySafe, escapeHtml, headerSafe, stripControl, textSafe } from "./sanitize";
import { devWarn, isProd } from "./env";

type Meta = { ip: string; userAgent: string; receivedAt: Date };

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (!isProd) devWarn("email", "RESEND_API_KEY not set — emails are logged to the console (development only).");
    return null;
  }
  return new Resend(key);
}

const FROM = () => process.env.EMAIL_FROM || "Apex Truck Tire <dispatch@apextrucktire.com>";
const TO = () => process.env.EMAIL_TO || SITE.email.display;

const FONT = "-apple-system,Segoe UI,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,Menlo,monospace";

function row(label: string, value: string) {
  const v = value || '<span style="color:#7a8899">—</span>';
  return `<tr><td style="padding:6px 12px 6px 0;color:#8fa3b8;font:12px/1.4 ${MONO};text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#f2f5f8;font:15px/1.5 ${FONT}">${v}</td></tr>`;
}

/** Every value is header-sanitized or HTML-escaped before it is interpolated. */
export function buildNotification(f: InquiryFields, meta: Meta) {
  const urgency = URGENCY_LABELS[f.urgency];
  const service = SERVICE_TYPE_LABELS[f.serviceType];
  const who = headerSafe(f.name || f.company || f.phone, 60);
  const subject = headerSafe(`[${urgency.toUpperCase()}] ${service} — ${who}`, 150);
  const isEmergency = f.urgency === "emergency";
  const telHref = "tel:" + escapeHtml(f.phone.replace(/[^\d+]/g, ""));

  const html = `<!doctype html><html><body style="margin:0;background:#07090d;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#12171f;border:1px solid rgba(143,163,184,.2);border-radius:6px;overflow:hidden">
    <div style="padding:18px 24px;background:${isEmergency ? "#ff6b1a" : "#1a212b"};color:${isEmergency ? "#0b0f14" : "#f2f5f8"};font:700 14px/1.2 ${FONT};letter-spacing:.12em;text-transform:uppercase">
      ${isEmergency ? "EMERGENCY — call the driver now" : "New inquiry"} · ${escapeHtml(urgency)}
    </div>
    <div style="padding:20px 24px">
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
        ${row("Phone", `<a href="${telHref}" style="color:#ff6b1a;font-weight:700;text-decoration:none">${escapeHtml(stripControl(f.phone))}</a>`)}
        ${row("Location", escapeHtml(stripControl(f.location)))}
        ${row("Service", escapeHtml(service))}
        ${row("Urgency", escapeHtml(urgency))}
        ${row("Name", escapeHtml(stripControl(f.name)))}
        ${row("Company", escapeHtml(stripControl(f.company)))}
        ${row("Email", f.email ? `<a href="mailto:${escapeHtml(headerSafe(f.email, 254))}" style="color:#c5cfda">${escapeHtml(headerSafe(f.email, 254))}</a>` : "")}
        ${row("Message", bodySafe(f.message))}
      </table>
      <p style="margin:20px 0 0;color:#7a8899;font:11px/1.5 ${MONO}">
        Received ${meta.receivedAt.toISOString()} · IP ${escapeHtml(headerSafe(meta.ip, 64))} · ${escapeHtml(headerSafe(meta.userAgent, 140))}
      </p>
    </div>
  </div></body></html>`;

  const text = [
    `${urgency} — ${service}`,
    `Phone: ${stripControl(f.phone)}`,
    `Location: ${stripControl(f.location)}`,
    `Name: ${stripControl(f.name)}`,
    `Company: ${stripControl(f.company)}`,
    `Email: ${stripControl(f.email)}`,
    `Message: ${textSafe(f.message)}`,
    "",
    `Received ${meta.receivedAt.toISOString()} from ${headerSafe(meta.ip, 64)}`,
  ].join("\n");

  return { subject, html, text };
}

export function buildAcknowledgement(f: InquiryFields) {
  const isEmergency = f.urgency === "emergency";
  const subject = isEmergency ? "Apex Truck Tire — dispatch has your location" : "Apex Truck Tire — we got your request";
  const name = escapeHtml(headerSafe(f.name || "there", 60));
  const body = isEmergency
    ? "Your request is with dispatch. If you have not heard from us within a few minutes, call the line below — a person answers 24/7."
    : "A tire specialist will reply during shop hours, usually within the hour. If it can't wait, call us.";
  const html = `<!doctype html><html><body style="margin:0;background:#07090d;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#12171f;border:1px solid rgba(143,163,184,.2);border-radius:6px;padding:28px;color:#f2f5f8;font:15px/1.6 ${FONT}">
    <p style="margin:0 0 6px;color:#ff6b1a;font:700 11px/1.2 ${MONO};letter-spacing:.14em;text-transform:uppercase">Apex Truck Tire · Bloomington, CA</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.2">Hi ${name}, ${isEmergency ? "we're on it." : "we got it."}</h1>
    <p style="margin:0 0 14px;color:#c5cfda">${body}</p>
    <p style="margin:0 0 18px"><a href="${SITE.phone.primary.href}" style="display:inline-block;background:#ff6b1a;color:#0b0f14;font-weight:700;text-decoration:none;padding:12px 18px;border-radius:4px;letter-spacing:.06em">Call ${SITE.phone.primary.display}</a></p>
    <p style="margin:0;color:#8fa3b8;font-size:13px">Direct line ${SITE.phone.local.display} · ${SITE.address.oneLine}<br>This is an automated acknowledgement. Reply to reach a person.</p>
  </div></body></html>`;
  const text = `Hi ${headerSafe(f.name || "there", 60)},\n\n${body}\n\nCall ${SITE.phone.primary.display} · Direct ${SITE.phone.local.display}\nApex Truck Tire · ${SITE.address.oneLine}`;
  return { subject, html, text };
}

export async function sendInquiry(f: InquiryFields, meta: Meta): Promise<{ ok: boolean }> {
  const notification = buildNotification(f, meta);
  const ack = f.email ? buildAcknowledgement(f) : null;
  const resend = client();

  if (!resend) {
    if (isProd) return { ok: false };
    console.info("[apex] (dev) notification email →", TO(), "\n" + notification.text);
    if (ack) console.info("[apex] (dev) acknowledgement →", f.email, "\n" + ack.text);
    return { ok: true };
  }

  const replyTo = f.email ? headerSafe(f.email, 254) : undefined;
  const { error } = await resend.emails.send({
    from: FROM(),
    to: [TO()],
    replyTo,
    subject: notification.subject,
    html: notification.html,
    text: notification.text,
    headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
  });
  if (error) {
    console.error("[apex] notification send failed", error.name, error.message);
    return { ok: false };
  }

  if (ack && f.email) {
    // Acknowledgement is best-effort; a failure here must not fail the inquiry.
    const r = await resend.emails.send({
      from: FROM(),
      to: [headerSafe(f.email, 254)],
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
    });
    if (r.error) console.error("[apex] acknowledgement send failed", r.error.name, r.error.message);
  }
  return { ok: true };
}
