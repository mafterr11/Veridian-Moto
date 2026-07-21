import "server-only";

import { env } from "@/env";

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
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendEnquiryNotification(input: EnquiryEmail) {
  if (
    !env.RESEND_API_KEY ||
    !env.RESEND_FROM_EMAIL ||
    !env.ENQUIRY_NOTIFICATION_EMAIL
  ) {
    return { sent: false, reason: "not-configured" as const };
  }

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
        <hr><p>${escapeHtml(input.message).replaceAll("\n", "<br>")}</p>`,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    return { sent: false, reason: "provider-error" as const };
  }
  return { sent: true as const };
}
