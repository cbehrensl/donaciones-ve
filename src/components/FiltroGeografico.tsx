import type { Estado, Municipio } from "@/lib/types";

interface FiltroGeograficoProps {
  estados: Estado[];
  municipios: Municipio[];
  estadoId: string;
  municipioId: string;
  estadoName?: string;
  municipioName?: string;
  onEstadoChange: (estadoId: string) => void;
  onMunicipioChange: (municipioId: string) => void;
}

export function FiltroGeografico({
  estados,
  municipios,
  estadoId,
  municipioId,
  estadoName,
  municipioName,
  onEstadoChange,
  onMunicipioChange,
}: FiltroGeograficoProps) {
  // Filtramos los municipios según el estado seleccionado
  const municipiosDelEstado = municipios.filter(
    (m) => m.estado_id === estadoId
  );

  return (
    <>
      <select
        id="filtro-estado"
        name={estadoName}
        value={estadoId}
        onChange={(e) => onEstadoChange(e.target.value)}
        className="w-full appearance-none rounded-lg border px-3 py-2 text-sm focus:outline-none"
        style={{ borderColor: "#bdd9f0", color: "#002858", background: "#fff" }}
      >
        <option value="">Estado</option>
        {estados.map((estado) => (
          <option key={estado.id} value={estado.id}>
            {estado.nombre}
          </option>
        ))}
      </select>

      <select
        id="filtro-municipio"
        name={municipioName}
        value={municipioId}
        onChange={(e) => onMunicipioChange(e.target.value)}
        disabled={!estadoId}
        className="w-full appearance-none rounded-lg border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
        style={{ borderColor: "#bdd9f0", color: "#002858", background: estadoId ? "#fff" : "#EBF3FB" }}
      >
        <option value="">
          {estadoId ? "Municipio" : "Municipio"}
        </option>
        {municipiosDelEstado.map((municipio) => (
          <option key={municipio.id} value={municipio.id}>
            {municipio.nombre}
          </option>
        ))}
      </select>
    </>
  );
}
