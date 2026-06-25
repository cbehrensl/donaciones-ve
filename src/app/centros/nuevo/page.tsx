import { getEstados, getMunicipios } from "@/lib/data";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";
import { NuevoCentroForm } from "./NuevoCentroForm";

export default async function NuevoCentroPage() {
  const configured = isSupabaseConfigured();
  const serviceConfigured = isSupabaseServiceConfigured();
  const [estados, municipios] = configured
    ? await Promise.all([getEstados(), getMunicipios()])
    : [[], []];

  return (
    <NuevoCentroForm
      estados={estados}
      municipios={municipios}
      supabaseConfigured={configured}
      supabaseServiceConfigured={serviceConfigured}
    />
  );
}
