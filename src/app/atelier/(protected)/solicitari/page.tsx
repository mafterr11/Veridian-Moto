import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Mail, MessageSquareText, Phone } from "lucide-react";

import { updateInquiryAction } from "@/app/atelier/(protected)/solicitari/actions";
import { AdminActionForm } from "@/components/admin/action-form";
import { AdminField } from "@/components/admin/form-field";
import { AdminPageHeader, AdminSection } from "@/components/admin/page-header";
import {
  AdminEmptyState,
  AdminStatusBadge,
} from "@/components/admin/status-badge";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminInquiries,
  type AdminInquiryFilters,
} from "@/data/queries/admin-inquiries";
import { formatMinorPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Solicitări" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
      <AdminPageHeader
        eyebrow="Lead-uri"
        title="Solicitări"
        description="Inbox unic pentru mesaje generale și cereri de ofertă cu configurația imuabilă atașată."
      />
      <Suspense fallback={<p className="mt-10 text-sm">Se încarcă…</p>}>
        <InquiryWorkspace searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function InquiryWorkspace({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawType = first(params.type);
  const rawStatus = first(params.status);
  const filters: AdminInquiryFilters = {
    type:
      rawType === "contact" || rawType === "configuration"
        ? rawType
        : undefined,
    status:
      rawStatus === "new" ||
      rawStatus === "contacted" ||
      rawStatus === "closed" ||
      rawStatus === "spam"
        ? rawStatus
        : undefined,
  };
  const rows = await getAdminInquiries(filters);

  return (
    <div className="mt-10 grid gap-6">
      <form
        action="/atelier/solicitari"
        className="border-obsidian/15 grid gap-4 border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <FilterSelect
          name="type"
          label="Tip"
          defaultValue={filters.type ?? "toate"}
        >
          <option value="toate">Toate tipurile</option>
          <option value="contact">Contact</option>
          <option value="configuration">Configurație</option>
        </FilterSelect>
        <FilterSelect
          name="status"
          label="Stare"
          defaultValue={filters.status ?? "toate"}
        >
          <option value="toate">Toate stările</option>
          <option value="new">Nouă</option>
          <option value="contacted">Contactată</option>
          <option value="closed">Închisă</option>
          <option value="spam">Spam</option>
        </FilterSelect>
        <button className="bg-obsidian text-porcelain h-10 px-5 text-sm font-bold">
          Filtrează
        </button>
      </form>

      <AdminSection title="Inbox" description={`${rows.length} solicitări`}>
        {rows.length ? (
          <div className="grid gap-3">
            {rows.map((row) => (
              <details key={row.id} className="border-obsidian/15 border">
                <summary className="cursor-pointer list-none p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge status={row.status} />
                    <span className="text-veridian-dark text-xs font-bold uppercase">
                      {row.type === "configuration"
                        ? "Configurație"
                        : "Contact"}
                    </span>
                    <strong>{row.subject}</strong>
                  </div>
                  <p className="text-steel mt-2 text-xs">
                    {row.name} · {row.createdAt.toLocaleString("ro-RO")}
                  </p>
                </summary>
                <div className="border-obsidian/10 grid gap-6 border-t p-4 lg:grid-cols-[1fr_0.9fr]">
                  <div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <a
                        href={`mailto:${row.email}`}
                        className="text-veridian-dark inline-flex items-center gap-2 font-bold"
                      >
                        <Mail className="size-4" /> {row.email}
                      </a>
                      {row.phone && (
                        <a
                          href={`tel:${row.phone}`}
                          className="inline-flex items-center gap-2 font-bold"
                        >
                          <Phone className="size-4" /> {row.phone}
                        </a>
                      )}
                    </div>
                    <p className="text-steel mt-2 text-xs">
                      Preferă:{" "}
                      {row.preferredContactMethod === "phone"
                        ? "telefon"
                        : "email"}
                    </p>
                    <div className="border-obsidian/10 mt-5 border p-4 text-sm leading-6 whitespace-pre-wrap">
                      {row.message}
                    </div>

                    {row.configurationReference && row.modelIdentity && (
                      <div className="bg-obsidian text-porcelain mt-5 p-5">
                        <p className="text-veridian text-xs font-bold uppercase">
                          Configurație {row.configurationReference}
                        </p>
                        <h3 className="font-heading mt-2 text-3xl font-bold uppercase">
                          {row.modelIdentity.name}
                        </h3>
                        <div className="mt-4 grid gap-2 text-sm">
                          {row.selectedChoices?.map((choice, index) => (
                            <div
                              key={`${choice.groupKey}-${choice.choiceCode}-${index}`}
                              className="flex justify-between gap-4"
                            >
                              <span>
                                {choice.groupName}: {choice.choiceName}
                              </span>
                              <span>
                                {choice.priceDeltaMinor
                                  ? `+ ${formatMinorPrice(choice.priceDeltaMinor)}`
                                  : "Inclus"}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-border mt-4 flex justify-between border-t pt-4 font-bold">
                          <span>Total</span>
                          <span>
                            {formatMinorPrice(row.totalPriceMinor ?? 0)}
                          </span>
                        </div>
                        <Link
                          href={`/configuratie/${row.configurationReference}`}
                          target="_blank"
                          className="text-veridian mt-4 inline-flex text-sm font-bold"
                        >
                          Deschide rezumatul public
                        </Link>
                      </div>
                    )}
                  </div>

                  <AdminActionForm
                    action={updateInquiryAction}
                    submitLabel="Salvează starea"
                  >
                    <input type="hidden" name="id" value={row.id} />
                    <AdminField label="Stare" htmlFor={`${row.id}-status`}>
                      <NativeSelect
                        id={`${row.id}-status`}
                        name="status"
                        defaultValue={row.status}
                        className="w-full"
                      >
                        <NativeSelectOption value="new">
                          Nouă
                        </NativeSelectOption>
                        <NativeSelectOption value="contacted">
                          Contactată
                        </NativeSelectOption>
                        <NativeSelectOption value="closed">
                          Închisă
                        </NativeSelectOption>
                        <NativeSelectOption value="spam">
                          Spam
                        </NativeSelectOption>
                      </NativeSelect>
                    </AdminField>
                    <AdminField
                      label="Note private"
                      htmlFor={`${row.id}-notes`}
                    >
                      <Textarea
                        id={`${row.id}-notes`}
                        name="privateAdminNotes"
                        rows={8}
                        defaultValue={row.privateAdminNotes ?? ""}
                      />
                    </AdminField>
                    <p className="text-steel flex gap-2 text-xs leading-5">
                      <MessageSquareText className="size-4 shrink-0" />
                      Accept confidențialitate: {row.privacyPolicyVersion},{" "}
                      {row.privacyAcknowledgedAt.toLocaleString("ro-RO")}
                    </p>
                  </AdminActionForm>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <AdminEmptyState>
            Nu există solicitări pentru filtrele alese.
          </AdminEmptyState>
        )}
      </AdminSection>
    </div>
  );
}

function FilterSelect({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="border-obsidian/20 h-10 border px-3 text-sm normal-case"
      >
        {children}
      </select>
    </label>
  );
}
