import type { ZodError } from "zod";

export type AdminFormIssue = {
  field: string;
  message: string;
};

export type AdminFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  issues?: AdminFormIssue[];
};

export const initialAdminFormState: AdminFormState = { status: "idle" };

export function validationErrorState(
  error: ZodError,
  message = "Verifică informațiile introduse.",
): AdminFormState {
  return {
    status: "error",
    message,
    issues: error.issues.map((issue) => ({
      field: issue.path.join(".") || "formular",
      message: issue.message,
    })),
  };
}

export function mutationErrorState(error: unknown): AdminFormState {
  return {
    status: "error",
    message:
      error instanceof Error && error.name === "AdminMutationError"
        ? error.message
        : "Operația nu a putut fi finalizată. Verifică datele și încearcă din nou.",
  };
}
