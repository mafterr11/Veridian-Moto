"use client";

import { ErrorState } from "@/components/layout/error-state";

export default function AtelierError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Atelierul nu a răspuns."
      description="Operația nu este considerată finalizată. Reîncarcă datele înainte să repeți o modificare."
      reset={reset}
      homeHref="/atelier"
    />
  );
}
