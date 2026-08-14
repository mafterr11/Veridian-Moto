# VERIDIAN Moto repository guidance

- Use pnpm; do not introduce another package manager or lockfile.
- Preserve Next.js App Router and TypeScript strict mode.
- Prefer Server Components. Add `"use client"` only at the smallest interactive boundary.
- Keep public brand components custom; use shadcn/ui Base UI primitives for accessible behavior.
- Add shadcn components individually through the CLI and review generated source before changing it.
- Keep domain rules pure and framework-independent.
- Put database access, secrets, and authorization in server-only modules.
- Never trust client-provided prices, roles, compatibility, or publication state.
- Store money as integer minor units with an explicit currency.
- Archive catalogue records instead of deleting records with historical references.
- Do not add checkout, customer accounts, 3D rendering, multilingual support, or other deferred scope without explicit approval.
- Before finishing a change, run the smallest relevant checks. Before a milestone handoff, run `pnpm check` and relevant Playwright tests.
- Commit and push finished work straight to `main`. Do not park it on a feature branch or open a pull request unless asked. Pushing to `main` deploys to production, so run the checks above first.
