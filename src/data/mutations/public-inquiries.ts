import "server-only";

import { and, eq, gte } from "drizzle-orm";

import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { configurationSnapshots, inquiries } from "@/db/schema";
import { PRIVACY_POLICY_VERSION } from "@/domain/enquiries/schemas";
import {
  isEnquiryNotificationConfigured,
  sendEnquiryNotification,
} from "@/lib/email/enquiry-notification";
import { renderOfferAttachment } from "@/lib/pdf/offer-attachment";

export class PublicInquiryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublicInquiryError";
  }
}

export async function createPublicInquiry(input: {
  configurationReference?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContactMethod: "email" | "phone";
}) {
  if (!isDatabaseConfigured()) {
    throw new PublicInquiryError(
      "Trimiterea formularului necesită conectarea bazei de date.",
    );
  }

  const db = getDatabase();
  const result = await db.transaction(async (tx) => {
    let configurationSnapshotId: string | undefined;
    if (input.configurationReference) {
      const [snapshot] = await tx
        .select({ id: configurationSnapshots.id })
        .from(configurationSnapshots)
        .where(
          eq(
            configurationSnapshots.publicReference,
            input.configurationReference,
          ),
        )
        .limit(1);
      if (!snapshot) {
        throw new PublicInquiryError(
          "Configurația atașată nu există sau referința este incorectă.",
        );
      }
      configurationSnapshotId = snapshot.id;
    }

    const [recentDuplicate] = await tx
      .select({ id: inquiries.id })
      .from(inquiries)
      .where(
        and(
          eq(inquiries.email, input.email),
          eq(inquiries.subject, input.subject),
          gte(inquiries.createdAt, new Date(Date.now() - 60_000)),
        ),
      )
      .limit(1);
    if (recentDuplicate) {
      throw new PublicInquiryError(
        "O solicitare identică a fost deja înregistrată. Așteaptă un minut înainte să retrimiți.",
      );
    }

    const [created] = await tx
      .insert(inquiries)
      .values({
        type: configurationSnapshotId ? "configuration" : "contact",
        configurationSnapshotId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        preferredContactMethod: input.preferredContactMethod,
        privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        privacyAcknowledgedAt: new Date(),
        status: "new",
      })
      .returning({ id: inquiries.id, type: inquiries.type });
    return created;
  });

  try {
    // Attaching the offer here is what lets VERIDIAN forward it to the customer
    // without opening the Atelier first. It renders to `undefined` on failure,
    // and the notification then carries the download link instead.
    const offer =
      input.configurationReference && isEnquiryNotificationConfigured()
        ? await renderOfferAttachment(input.configurationReference)
        : undefined;

    await sendEnquiryNotification({
      ...input,
      id: result.id,
      type: result.type,
      offer,
    });
  } catch {
    // The database inbox is authoritative. A provider/network failure must not
    // discard or duplicate the visitor's enquiry.
  }

  return {
    id: result.id,
    displayReference: `SOL-${result.id.slice(0, 8).toUpperCase()}`,
  };
}
