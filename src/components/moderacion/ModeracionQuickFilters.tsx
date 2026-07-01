import Link from "next/link";
import type { ModeracionTab } from "@/lib/types";

interface QuickFilter {
  label: string;
  href: string;
  active?: boolean;
}

interface ModeracionQuickFiltersProps {
  filters: QuickFilter[];
}

export function ModeracionQuickFilters({ filters }: ModeracionQuickFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <Link
          key={filter.href}
          href={filter.href}
          aria-current={filter.active ? "true" : undefined}
          className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
            filter.active
              ? "border-blue-800 bg-blue-800 text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}

export function buildCentrosQuickFilters(
  token: string,
  current: {
    verificacion?: string;
    estatus?: string;
  },
): QuickFilter[] {
  const base = { token, tab: "centros" as ModeracionTab };
  const mk = (extra: Record<string, string>, label: string, active: boolean) => ({
    label,
    active,
    href: `/moderacion?${new URLSearchParams({ ...base, ...extra }).toString()}`,
  });

  return [
    mk({ verificacion: "pendientes" }, "Pendientes", current.verificacion === "pendientes"),
    mk({ estatus: "cerrado" }, "Ocultos", current.estatus === "cerrado"),
    mk({ estatus: "saturado" }, "Saturados", current.estatus === "saturado"),
  ];
}

export function buildRefugiosQuickFilters(
  token: string,
  current: {
    confirmacion?: string;
    saturacion?: string;
    actividad?: string;
  },
): QuickFilter[] {
  const base = { token, tab: "refugios" as ModeracionTab };
  const mk = (extra: Record<string, string>, label: string, active: boolean) => ({
    label,
    active,
    href: `/moderacion?${new URLSearchParams({ ...base, ...extra }).toString()}`,
  });

  return [
    mk(
      { confirmacion: "pendientes" },
      "Pendientes",
      current.confirmacion === "pendientes",
    ),
    mk({ saturacion: "saturados" }, "Saturados", current.saturacion === "saturados"),
    mk({ actividad: "inactivos" }, "Inactivos", current.actividad === "inactivos"),
  ];
}
