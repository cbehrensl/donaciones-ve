import { getEstados } from "@/lib/data";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { NuevoRefugioForm } from "./NuevoRefugioForm";

export default async function NuevoRefugioPage() {
  const configured = isSupabaseConfigured();
  const serviceConfigured = isSupabaseServiceConfigured();
  const estados = configured ? await getEstados() : [];

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <OwnerNav />
      </div>
      <NuevoRefugioForm
        estados={estados}
        supabaseConfigured={configured}
        supabaseServiceConfigured={serviceConfigured}
      />
    </>
  );
}
