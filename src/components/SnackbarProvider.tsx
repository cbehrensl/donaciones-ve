"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  getActionMessage,
  type ActionFeedbackMessage,
} from "@/lib/action-feedback";

type ShowSnackbar = (code: string, options?: { refresh?: boolean }) => void;

const SnackbarContext = createContext<ShowSnackbar | null>(null);

export function useSnackbar(): ShowSnackbar {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar debe usarse dentro de SnackbarProvider.");
  }
  return context;
}

interface SnackbarProviderProps {
  children: ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const router = useRouter();
  const [message, setMessage] = useState<ActionFeedbackMessage | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const showSnackbar = useCallback(
    (code: string, options?: { refresh?: boolean }) => {
      const nextMessage = getActionMessage(code);
      if (!nextMessage) {
        return;
      }

      setMessage(nextMessage);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setMessage(null);
      }, 4200);

      if (options?.refresh) {
        router.refresh();
      }
    },
    [router],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      {message ? (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed bottom-4 left-1/2 z-[100] w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            message.tone === "success"
              ? "border-emerald-300 bg-emerald-950 text-emerald-50"
              : "border-red-300 bg-red-950 text-red-50"
          }`}
        >
          {message.text}
        </div>
      ) : null}
    </SnackbarContext.Provider>
  );
}
