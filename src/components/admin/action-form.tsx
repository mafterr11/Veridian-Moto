"use client";

import { useActionState } from "react";
import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  initialAdminFormState,
  type AdminFormState,
} from "@/domain/admin/form-state";
import { cn } from "@/lib/utils";

type AdminAction = (
  state: AdminFormState,
  formData: FormData,
) => Promise<AdminFormState>;

export function AdminActionForm({
  action,
  children,
  submitLabel = "Salvează",
  pendingLabel = "Se salvează",
  className,
  buttonVariant = "default",
  buttonClassName,
}: {
  action: AdminAction;
  children?: React.ReactNode;
  submitLabel?: string;
  pendingLabel?: string;
  className?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive";
  buttonClassName?: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminFormState,
  );

  return (
    <form action={formAction} className={cn("grid gap-5", className)}>
      {children}

      {state.message && (
        <div
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "border p-3 text-sm leading-6",
            state.status === "error"
              ? "border-destructive/35 bg-destructive/8 text-destructive"
              : "border-veridian-dark/30 bg-veridian/8 text-veridian-dark",
          )}
        >
          <div className="flex items-start gap-2">
            {state.status === "error" ? (
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="font-semibold">{state.message}</p>
              {state.issues?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {state.issues.map((issue, index) => (
                    <li key={`${issue.field}-${index}`}>
                      <span className="font-semibold">{issue.field}:</span>{" "}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant={buttonVariant}
        disabled={pending}
        className={cn("justify-self-start", buttonClassName)}
      >
        {pending && (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        )}
        {pending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
