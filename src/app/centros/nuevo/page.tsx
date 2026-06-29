import { getEstados, getMunicipios } from "@/lib/data";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { NuevoCentroForm } from "./NuevoCentroForm";

export default async function NuevoCentroPage() {
  const configured = isSupabaseConfigured();
  const serviceConfigured = isSupabaseServiceConfigured();
  const [estados, municipios] = configured
    ? await Promise.all([getEstados(), getMunicipios()])
    : [[], []];

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <OwnerNav />
      </div>
      <NuevoCentroForm
        estados={estados}
        municipios={municipios}
        supabaseConfigured={configured}
        supabaseServiceConfigured={serviceConfigured}
      />
    </>
  );
}
