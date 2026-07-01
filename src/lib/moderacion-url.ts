import type { ModeracionTab } from "@/lib/types";

export function parseModeracionTab(value?: string): ModeracionTab {
  return value === "refugios" ? "refugios" : "centros";
}

export function buildModeracionHref(
  token: string,
  tab: ModeracionTab,
  filters: Record<string, string | undefined>,
  page = 1,
): string {
  const params = new URLSearchParams({ token, tab });
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== "todos") {
      params.set(key, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  return `/moderacion?${params.toString()}`;
}
