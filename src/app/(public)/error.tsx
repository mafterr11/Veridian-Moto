"use client";

import { ErrorState } from "@/components/layout/error-state";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="Drumul s-a întrerupt aici."
      description="Conținutul public nu a putut fi încărcat. Poți reîncerca fără să pierzi vreo comandă sau plată — această experiență nu procesează checkout."
      reset={reset}
    />
  );
}
