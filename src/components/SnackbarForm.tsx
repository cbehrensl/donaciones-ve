"use client";

import { useTransition, type ReactNode } from "react";
import { useSnackbar } from "@/components/SnackbarProvider";
import type { ActionResult } from "@/lib/action-feedback";

interface SnackbarFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  refreshOnSuccess?: boolean;
}

export function SnackbarForm({
  action,
  children,
  className,
  refreshOnSuccess = true,
}: SnackbarFormProps) {
  const showSnackbar = useSnackbar();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      showSnackbar(result.code, {
        refresh: result.ok && refreshOnSuccess,
      });
    });
  }

  return (
    <form
      action={handleSubmit}
      className={className}
      aria-busy={isPending}
    >
      {children}
    </form>
  );
}
