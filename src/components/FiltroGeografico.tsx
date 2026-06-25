import type { Estado, Municipio } from "@/lib/types";

interface FiltroGeograficoProps {
  estados: Estado[];
  municipios: Municipio[];
  estadoId: string;
  municipioId: string;
  onEstadoChange: (estadoId: string) => void;
  onMunicipioChange: (municipioId: string) => void;
}

export function FiltroGeografico({
  estados,
  municipios,
  estadoId,
  municipioId,
  onEstadoChange,
  onMunicipioChange,
}: FiltroGeograficoProps) {
  // Filtramos los municipios según el estado seleccionado
  const municipiosDelEstado = municipios.filter(
    (m) => m.estado_id === estadoId
  );

  return (
    <div className="mb-2 flex flex-col gap-4 sm:flex-row">
      {/* Selector de Estado */}
      <div className="w-full">
        <label
          htmlFor="filtro-estado"
          className="mb-1.5 block text-sm font-bold uppercase tracking-wider text-zinc-800"
        >
          Estado
        </label>
        <select
          id="filtro-estado"
          value={estadoId}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="w-full appearance-none rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base font-medium text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-0"
        >
          <option value="">Selecciona un estado</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Municipio */}
      <div className="w-full">
        <label
          htmlFor="filtro-municipio"
          className={`mb-1.5 block text-sm font-bold uppercase tracking-wider ${
            estadoId ? "text-zinc-800" : "text-zinc-400"
          }`}
        >
          Municipio
        </label>
        <select
          id="filtro-municipio"
          value={municipioId}
          onChange={(e) => onMunicipioChange(e.target.value)}
          disabled={!estadoId}
          className="w-full appearance-none rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base font-medium text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-0 disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          <option value="">
            {estadoId ? "Todos los municipios" : "Primero selecciona un estado"}
          </option>
          {municipiosDelEstado.map((municipio) => (
            <option key={municipio.id} value={municipio.id}>
              {municipio.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
