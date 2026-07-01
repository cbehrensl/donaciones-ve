import Link from "next/link";
import type { ModeracionTab } from "@/lib/types";

interface ModeracionTabsProps {
  activeTab: ModeracionTab;
  centrosHref: string;
  refugiosHref: string;
}

export function ModeracionTabs({
  activeTab,
  centrosHref,
  refugiosHref,
}: ModeracionTabsProps) {
  const tabs: { id: ModeracionTab; label: string; href: string }[] = [
    { id: "centros", label: "Centros", href: centrosHref },
    { id: "refugios", label: "Refugios", href: refugiosHref },
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
            className={`flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-bold transition ${
              isActive
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
