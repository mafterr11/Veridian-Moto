import "server-only";

import { env } from "@/env";
import type { OfferAttachment } from "@/lib/pdf/offer-attachment";

type EnquiryEmail = {
  id: string;
  type: "contact" | "configuration";
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContactMethod: "email" | "phone";
  configurationReference?: string;
  /** The configured motorcycle as a ready-to-forward offer document. */
  offer?: OfferAttachment;
};

/**
 * Rendering the offer roughly doubles the request body, and a provider that is
 * slow to accept it should not hold the visitor's form open. Attachments get a
 * wider window than a plain notification.
 */
const PLAIN_TIMEOUT_MS = 8_000;
const ATTACHMENT_TIMEOUT_MS = 20_000;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function offerUrl(reference: string) {
  return new URL(`/api/oferta/${reference}`, env.NEXT_PUBLIC_APP_URL).href;
}

/**
 * Whether a notification can actually be delivered.
 *
 * Callers check this before doing work that only the notification consumes —
 * rendering the offer attachment above all — so an unconfigured provider costs
 * nothing per enquiry.
 */
export function isEnquiryNotificationConfigured() {
  return Boolean(
    env.RESEND_API_KEY &&
    env.RESEND_FROM_EMAIL &&
    env.ENQUIRY_NOTIFICATION_EMAIL,
  );
}

export async function sendEnquiryNotification(input: EnquiryEmail) {
  if (!isEnquiryNotificationConfigured()) {
    return { sent: false, reason: "not-configured" as const };
  }

  // The link stays useful after the attachment is gone from an inbox, and it is
  // the only offer pointer when rendering failed.
  const offerLink = input.configurationReference
    ? offerUrl(input.configurationReference)
    : undefined;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `veridian-inquiry-${input.id}`,
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [env.ENQUIRY_NOTIFICATION_EMAIL],
      reply_to: input.email,
      subject: `[VERIDIAN] ${input.subject}`,
      text: [
        `Tip: ${input.type}`,
        `Nume: ${input.name}`,
        `Email: ${input.email}`,
        `Telefon: ${input.phone ?? "—"}`,
        `Contact preferat: ${input.preferredContactMethod}`,
        `Configurație: ${input.configurationReference ?? "—"}`,
        ...(offerLink ? [`Ofertă PDF: ${offerLink}`] : []),
        ...(input.configurationReference && !input.offer
          ? ["Atenție: oferta PDF nu a putut fi atașată. Folosește linkul."]
          : []),
        "",
        input.message,
      ].join("\n"),
      html: `<h1>Solicitare VERIDIAN</h1>
        <p><strong>Tip:</strong> ${escapeHtml(input.type)}</p>
        <p><strong>Nume:</strong> ${escapeHtml(input.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(input.phone ?? "—")}</p>
        <p><strong>Contact preferat:</strong> ${escapeHtml(input.preferredContactMethod)}</p>
        <p><strong>Configurație:</strong> ${escapeHtml(input.configurationReference ?? "—")}</p>
        ${
          offerLink
            ? `<p><strong>Ofertă PDF:</strong> <a href="${escapeHtml(offerLink)}">${escapeHtml(
                input.offer?.filename ?? "descarcă oferta",
              )}</a>${
                input.offer
                  ? " — atașată acestui mesaj."
                  : " — atașamentul nu a putut fi generat, folosește linkul."
              }</p>`
            : ""
        }
        <hr><p>${escapeHtml(input.message).replaceAll("\n", "<br>")}</p>`,
      ...(input.offer
        ? {
            attachments: [
              { filename: input.offer.filename, content: input.offer.content },
            ],
          }
        : {}),
    }),
    signal: AbortSignal.timeout(
      input.offer ? ATTACHMENT_TIMEOUT_MS : PLAIN_TIMEOUT_MS,
    ),
  });

  if (!response.ok) {
    return { sent: false, reason: "provider-error" as const };
  }
  return { sent: true as const };
}
