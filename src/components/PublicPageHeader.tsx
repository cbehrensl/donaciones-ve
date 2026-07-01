import Link from "next/link";
import type { ReactNode } from "react";

interface PublicPageHeaderProps {
  tag: string;
  tagColorClass: string;
  title: string;
  description: ReactNode;
}

export function PublicPageHeader({
  tag,
  tagColorClass,
  title,
  description,
}: PublicPageHeaderProps) {
  return (
    <header className="mb-8 border-b border-zinc-200 pb-4">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 transition hover:text-zinc-800"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al hub de apoyo
      </Link>
      <p
        className={`text-xs font-bold uppercase tracking-wider sm:text-sm sm:font-black sm:tracking-wide ${tagColorClass}`}
      >
        {tag}
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
        {title}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 sm:text-base">{description}</p>
    </header>
  );
}
