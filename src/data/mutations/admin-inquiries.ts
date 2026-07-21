import "server-only";

import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { inquiries } from "@/db/schema";
import { assertAdmin } from "@/data/auth/admin-session";
import { AdminMutationError } from "@/data/mutations/admin-catalogue";
import type { updateInquirySchema } from "@/domain/enquiries/schemas";
import type { z } from "zod";

type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;

export async function updateInquiry(input: UpdateInquiryInput) {
  await assertAdmin();
  const [updated] = await getDatabase()
    .update(inquiries)
    .set({
      status: input.status,
      privateAdminNotes: input.privateAdminNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, input.id))
    .returning({ id: inquiries.id });
  if (!updated) throw new AdminMutationError("Solicitarea nu mai există.");
}
