import Link from "next/link";

interface OwnerActionBlockProps {
  title: string;
  subtitle: string;
  description: string;
  registerHref: string;
  registerLabel: string;
  manageHref: string;
  manageLabel: string;
  colorTheme?: "blue" | "purple";
}

export function OwnerActionBlock({
  title,
  subtitle,
  description,
  registerHref,
  registerLabel,
  manageHref,
  manageLabel,
  colorTheme = "blue",
}: OwnerActionBlockProps) {
  const isBlue = colorTheme === "blue";

  return (
    <section
      className={`mb-8 rounded-2xl border p-4 shadow-sm sm:p-5 ${
        isBlue ? "border-blue-200 bg-white" : "border-purple-200 bg-white"
      }`}
    >
      <p
        className={`text-xs font-black uppercase tracking-wide ${
          isBlue ? "text-blue-800" : "text-purple-800"
        }`}
      >
        {title}
      </p>
      <h2 className="mt-1 text-lg font-black text-zinc-900 sm:text-xl">
        {subtitle}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={registerHref}
          className={`rounded-lg px-4 py-2.5 text-center text-sm font-bold text-white transition ${
            isBlue
              ? "bg-blue-800 hover:bg-blue-900"
              : "bg-purple-700 hover:bg-purple-800"
          }`}
        >
          {registerLabel}
        </Link>
        <Link
          href={manageHref}
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm font-bold text-zinc-800 transition hover:bg-zinc-50"
        >
          {manageLabel}
        </Link>
      </div>
    </section>
  );
}
