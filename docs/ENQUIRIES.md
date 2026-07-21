# Enquiries and offer requests

Phase 7 uses PostgreSQL as the authoritative enquiry inbox. Email is a best-effort
notification, not the system of record, which keeps the project functional on the
Supabase free tier without a transactional-email subscription.

## Visitor flow

Visitors can submit a general contact message or open `/contact` from a saved
configuration. A linked offer request stores the snapshot foreign key, so Atelier
shows the exact immutable options and prices even after the live catalogue changes.
The public configuration URL itself contains no contact data.

The Server Action validates and normalizes:

- name, email, optional phone, subject, and a 20–5,000 character message;
- preferred contact method, requiring a phone number when `phone` is selected;
- the optional 12-character configuration reference;
- privacy-policy acknowledgement and the recorded policy version.

Low-cost abuse controls include a hidden honeypot, a two-second minimum form time,
a two-hour form-session limit, input and control-character limits, and rejection of
the same email/subject pair within one minute. Phase 9 adds atomic PostgreSQL limits:
five enquiries per address and three per normalized email in 15 minutes. Request
identifiers are stored as HMAC digests, never as raw addresses or emails.

Set a unique server-only `RATE_LIMIT_SECRET` with at least 32 characters. It is
required in production whenever `DATABASE_URL` is present. The application fails
closed if a database-backed public action has no key. The address resolver assumes
the deployment proxy overwrites forwarding headers; validate that assumption for
the chosen host.

These controls suit a personal demo. A real public launch should still add
provider- or edge-level abuse controls and, if warranted, a privacy-conscious
challenge service.

## Write and notification order

1. Validate the Server Action payload.
2. Resolve the optional configuration reference inside a database transaction.
3. reject a recent duplicate and insert the enquiry.
4. Notify the configured address through Resend after the commit.
5. Return a short display reference such as `SOL-12AB34CD`.

The Resend request uses the enquiry UUID as its idempotency key, escapes all HTML,
sets the visitor as `reply_to`, and times out after eight seconds. A provider failure
does not remove or duplicate the database record and does not turn a successfully
recorded enquiry into an error for the visitor.

Set all three values to enable notifications:

```dotenv
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=VERIDIAN Moto <solicitari@your-verified-domain.example>
ENQUIRY_NOTIFICATION_EMAIL=owner@example.com
```

Leave them empty to use only the protected database inbox at
`/atelier/solicitari`.

## Administration and privacy

The inbox is protected by the same session, email allow-list, active profile, and
server-side authorization checks as the catalogue studio. Administrators can filter
by type/status, inspect contact details and exact snapshot data, and maintain a
status plus private notes. PII is never included in public DTOs or configuration
pages.

This demo does not yet automate retention, export, or erasure requests. Before real
commercial use, define a retention period, add an audited deletion/anonymization
workflow, replace fictional contact details, review the privacy text with qualified
advice, and configure operational monitoring. Do not use real visitor data in a
public portfolio deployment that has no owner-managed privacy process.
