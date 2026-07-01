import Link from "next/link";
import type { ModeracionTab } from "@/lib/types";

interface ModeracionTabsProps {
  activeTab: ModeracionTab;
  centrosHref: string;
  refugiosHref: string;
  pendientesCentros?: number;
  pendientesRefugios?: number;
}

export function ModeracionTabs({
  activeTab,
  centrosHref,
  refugiosHref,
  pendientesCentros = 0,
  pendientesRefugios = 0,
}: ModeracionTabsProps) {
  const tabs: {
    id: ModeracionTab;
    label: string;
    href: string;
    pending: number;
  }[] = [
    { id: "centros", label: "Centros", href: centrosHref, pending: pendientesCentros },
    { id: "refugios", label: "Refugios", href: refugiosHref, pending: pendientesRefugios },
  ];

  return (
    <nav
      aria-label="Entidades de moderación"
      className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-center text-sm font-bold transition ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {tab.label}
            {tab.pending > 0 ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive
                    ? "bg-amber-100 text-amber-900"
                    : "bg-amber-200/80 text-amber-900"
                }`}
              >
                {tab.pending}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
