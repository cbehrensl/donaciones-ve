import { OwnerActionBlock } from "@/components/OwnerActionBlock";
import { PublicPageHeader } from "@/components/PublicPageHeader";
import { getRefugios } from "@/lib/data";
import { RefugiosClient } from "./RefugiosClient";

export const revalidate = 30;

export default async function RefugiosPage() {
  const refugios = await getRefugios();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PublicPageHeader
          tag="Refugios activos"
          tagColorClass="text-purple-600"
          title="Necesito un refugio"
          description={
            <>
              Lugares habilitados como refugio para personas afectadas.
              {refugios.length > 0 && (
                <span className="ml-1 font-semibold text-zinc-800">
                  ({refugios.length} activos)
                </span>
              )}
            </>
          }
        />

        <OwnerActionBlock
          title="¿Manejas un refugio?"
          subtitle="Registra o actualiza tu refugio"
          description="Si eres responsable, desde aquí puedes crear un refugio nuevo o entrar con tu código de gestión para actualizar datos y necesidades."
          registerHref="/refugios/nuevo"
          registerLabel="Registrar refugio"
          manageHref="/refugios/gestion"
          manageLabel="Administrar con código"
          colorTheme="purple"
        />

        <RefugiosClient refugios={refugios} />
      </div>
    </main>
  );
}
