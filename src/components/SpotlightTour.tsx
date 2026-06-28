"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

interface TourStep {
  targetId: string;
  title: string;
  body: string;
}

interface SpotlightTourProps {
  steps: TourStep[];
  storageKey?: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const DEFAULT_STORAGE_KEY = "donaciones-ve-onboarding-v1";

export function SpotlightTour({
  steps,
  storageKey = DEFAULT_STORAGE_KEY,
}: SpotlightTourProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (window.localStorage.getItem(storageKey) !== "done") {
      setIsVisible(true);
    }
  }, [storageKey]);

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const closeTour = useCallback(() => {
    window.localStorage.setItem(storageKey, "done");
    setIsVisible(false);
  }, [storageKey]);

  const updateRect = useCallback(() => {
    if (!currentStep) {
      setRect(null);
      return;
    }

    const target = document.getElementById(currentStep.targetId);

    if (!target) {
      setRect(null);
      return;
    }

    const nextRect = target.getBoundingClientRect();
    const padding = 8;

    setRect({
      top: Math.max(nextRect.top - padding, 8),
      left: Math.max(nextRect.left - padding, 8),
      width: nextRect.width + padding * 2,
      height: nextRect.height + padding * 2,
    });
  }, [currentStep]);

  useEffect(() => {
    if (!isVisible || !currentStep) {
      return;
    }

    const target = document.getElementById(currentStep.targetId);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });

    const timeoutId = window.setTimeout(updateRect, 250);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [currentStep, isVisible, updateRect]);

  const cardPosition = useMemo(() => {
    if (!rect) {
      return "left-4 right-4 bottom-6";
    }

    const canFitBelow = rect.top + rect.height + 220 < window.innerHeight;
    const top = canFitBelow ? rect.top + rect.height + 16 : 24;
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - 336);

    return { top, left };
  }, [rect]);

  if (!isVisible || !currentStep) {
    return (
      <button
        type="button"
        onClick={() => {
          setStepIndex(0);
          setIsVisible(true);
        }}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-900 shadow-lg"
      >
        Ver guía
      </button>
    );
  }

  const positionedCard =
    rect && typeof cardPosition !== "string"
      ? {
          top: cardPosition?.top ?? 24,
          left: cardPosition?.left ?? 16,
        }
      : undefined;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {rect ? (
        <>
          <div
            aria-hidden
            className="absolute left-0 right-0 top-0 bg-zinc-950/65"
            style={{ height: rect.top }}
          />
          <div
            aria-hidden
            className="absolute left-0 bg-zinc-950/65"
            style={{ top: rect.top, width: rect.left, height: rect.height }}
          />
          <div
            aria-hidden
            className="absolute right-0 bg-zinc-950/65"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              height: rect.height,
            }}
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 right-0 bg-zinc-950/65"
            style={{ top: rect.top + rect.height }}
          />
          <div
            aria-hidden
            className="absolute rounded-2xl border-2 border-white shadow-lg transition-all"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-zinc-950/65" />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Guía rápida"
        className={`pointer-events-auto fixed max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-2xl ${
          typeof cardPosition === "string" ? cardPosition : ""
        }`}
        style={positionedCard}
      >
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-800">
          Paso {stepIndex + 1} de {steps.length}
        </p>
        <h2 className="text-xl font-black">{currentStep.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {currentStep.body}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeTour}
            className="text-sm font-bold text-zinc-500"
          >
            Omitir
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setStepIndex((value) => value - 1)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold"
              >
                Atrás
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (isLastStep) {
                  closeTour();
                  return;
                }
                setStepIndex((value) => value + 1);
              }}
              className="rounded-lg bg-blue-800 px-3 py-2 text-sm font-bold text-white"
            >
              {isLastStep ? "Entendido" : "Siguiente"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
