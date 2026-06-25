import { getActionMessage } from "@/lib/action-feedback";

interface ActionFeedbackProps {
  ok?: string;
  error?: string;
}

export function ActionFeedback({ ok, error }: ActionFeedbackProps) {
  const success = getActionMessage(ok);
  const failure = getActionMessage(error);

  if (success) {
    return (
      <section
        role="status"
        aria-live="polite"
        className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
      >
        {success.text}
      </section>
    );
  }

  if (failure) {
    return (
      <section
        role="alert"
        className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900"
      >
        {failure.text}
      </section>
    );
  }

  return null;
}
