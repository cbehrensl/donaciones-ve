"use client";

import { SnackbarProvider } from "@/components/SnackbarProvider";
import type { ReactNode } from "react";

interface SnackbarShellProps {
  children: ReactNode;
}

export function SnackbarShell({ children }: SnackbarShellProps) {
  return <SnackbarProvider>{children}</SnackbarProvider>;
}
