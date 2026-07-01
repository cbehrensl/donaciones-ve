"use client";

import { formatWhatsappHref } from "@/lib/contact-links";
import type { DonationLink } from "@/lib/types";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getFallbackEmoji(category: DonationLink["category"]): string {
  return category === "psychological" ? "🧠" : "💛";
}

interface DonationCardProps {
  link: DonationLink;
  ctaLabel?: string;
}

export function DonationCard({ link, ctaLabel = "Donar" }: DonationCardProps) {
  const href = link.url ?? (link.whatsapp_phone ? formatWhatsappHref(link.whatsapp_phone) : "#");
  const domain = link.url ? getDomain(link.url) : "";
  const imageUrl =
    link.image_url ||
    (domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : null);
  const fallbackEmoji = getFallbackEmoji(link.category);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={imageUrl} alt="" className="h-8 w-8 object-contain" />
        ) : (
          <span className="text-xl" aria-hidden>
            {fallbackEmoji}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black leading-snug text-zinc-900">{link.title}</h3>
          <span
            className="mt-0.5 hidden shrink-0 text-zinc-300 transition group-hover:text-amber-600 sm:inline"
            aria-hidden
          >
            ↗
          </span>
        </div>
        {domain ? (
          <p className="mt-0.5 text-xs font-semibold text-zinc-400">{domain}</p>
        ) : link.whatsapp_phone ? (
          <p className="mt-0.5 text-xs font-semibold text-emerald-600">
            WhatsApp {link.whatsapp_phone}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 sm:line-clamp-1">
          {link.description}
        </p>
      </div>

      <span className="inline-flex w-full items-center justify-center rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-amber-800 sm:w-auto sm:shrink-0">
        {ctaLabel}
        <span className="ml-1 sm:hidden" aria-hidden>
          ↗
        </span>
      </span>
    </a>
  );
}
