import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";
import { getEstados, getMunicipios } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { NuevaCocinaForm } from "./NuevaCocinaForm";

export default async function NuevaCocinaPage() {
  const configured = isSupabaseConfigured();
  const [estados, municipios] = configured
    ? await Promise.all([getEstados(), getMunicipios()])
    : [[], []];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <FoodOwnerNav />
      <NuevaCocinaForm
        estados={estados}
        municipios={municipios}
        supabaseConfigured={configured}
      />
    </main>
  );
}
