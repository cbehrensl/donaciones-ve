import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";
import { getEstados, getMunicipios } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { NuevoProductorForm } from "./NuevoProductorForm";

export default async function NuevoProductorPage() {
  const configured = isSupabaseConfigured();
  const [estados, municipios] = configured
    ? await Promise.all([getEstados(), getMunicipios()])
    : [[], []];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <FoodOwnerNav />
      <NuevoProductorForm
        estados={estados}
        municipios={municipios}
        supabaseConfigured={configured}
      />
    </main>
  );
}
