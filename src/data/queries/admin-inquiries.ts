import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { configurationSnapshots, inquiries } from "@/db/schema";
import {
  assertAdmin,
  isAdminInfrastructureConfigured,
} from "@/data/auth/admin-session";

export type AdminInquiryFilters = {
  type?: "contact" | "configuration";
  status?: "new" | "contacted" | "closed" | "spam";
};

export async function getAdminInquiries(filters: AdminInquiryFilters = {}) {
  if (!isAdminInfrastructureConfigured()) return [];
  await assertAdmin();

  const conditions = [];
  if (filters.type) conditions.push(eq(inquiries.type, filters.type));
  if (filters.status) conditions.push(eq(inquiries.status, filters.status));

  return getDatabase()
    .select({
      id: inquiries.id,
      type: inquiries.type,
      status: inquiries.status,
      name: inquiries.name,
      email: inquiries.email,
      phone: inquiries.phone,
      subject: inquiries.subject,
      message: inquiries.message,
      preferredContactMethod: inquiries.preferredContactMethod,
      privacyPolicyVersion: inquiries.privacyPolicyVersion,
      privacyAcknowledgedAt: inquiries.privacyAcknowledgedAt,
      privateAdminNotes: inquiries.privateAdminNotes,
      createdAt: inquiries.createdAt,
      updatedAt: inquiries.updatedAt,
      configurationReference: configurationSnapshots.publicReference,
      modelIdentity: configurationSnapshots.modelIdentity,
      basePriceMinor: configurationSnapshots.basePriceMinor,
      selectedChoices: configurationSnapshots.selectedChoices,
      totalPriceMinor: configurationSnapshots.totalPriceMinor,
    })
    .from(inquiries)
    .leftJoin(
      configurationSnapshots,
      eq(inquiries.configurationSnapshotId, configurationSnapshots.id),
    )
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(inquiries.createdAt));
}
