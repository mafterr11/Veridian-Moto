import type { ComponentPropsWithoutRef } from "react";

type AdminDocumentLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
};

/**
 * The private Atelier deliberately avoids App Router client transitions.
 *
 * Next.js 16 can issue duplicate partial-prefetch/RSC requests for visible
 * links. Every Atelier route performs authorization and live database work,
 * so that fan-out can exhaust a small serverless database pool. A normal
 * document navigation is predictable here: one click produces one request.
 */
export function AdminDocumentLink({ href, ...props }: AdminDocumentLinkProps) {
  return <a {...props} href={href} data-admin-navigation="document" />;
}
