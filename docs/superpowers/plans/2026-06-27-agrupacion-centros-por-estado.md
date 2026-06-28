# Agrupación de Centros por Estado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la lista plana de centros en la home page por secciones colapsables agrupadas por estado, ordenadas por urgencia descendente, sin tocar los filtros existentes.

**Architecture:** Se agrega `estado_id` al modelo `CentroAcopio` (ya viene de Supabase pero no estaba mapeado). Se crea un componente `CentroGrupoEstado` con `<details>` nativo. `HomeClient` agrupa y ordena los centros antes de renderizarlos. `calcularSemafaroGrupo` se agrega a `semaforo.ts` para ser compartido entre el componente y la lógica de ordenamiento.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, HTML nativo `<details>`/`<summary>`

## Global Constraints

- No modificar `FiltroGeografico`, el formulario GET, `CentroCard`, `SpotlightTour` ni el bloque de contactos de emergencia.
- No agregar dependencias nuevas.
- No cambiar queries de Supabase.
- TypeScript estricto: `npx tsc --noEmit` debe pasar sin errores en cada tarea.
- Tailwind 4: usar clases utilitarias directamente, sin `@apply`.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/lib/types.ts` | Modificar | Agregar `estado_id: string \| null` a `CentroAcopio` |
| `src/lib/data.ts` | Modificar | Mapear `estado_id` en `normalizeCentro` |
| `src/lib/semaforo.ts` | Modificar | Agregar `calcularSemafaroGrupo` exportado |
| `src/components/CentroGrupoEstado.tsx` | Crear | Componente `<details>` con header de grupo y lista de `CentroCard` |
| `src/app/HomeClient.tsx` | Modificar | Reemplazar lista plana con lógica de agrupación |

---

## Task 1: Mapear `estado_id` en tipo y normalizador

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/data.ts`

**Interfaces:**
- Produces: `CentroAcopio.estado_id: string | null` — usado por Tasks 2 y 3

- [ ] **Step 1: Agregar `estado_id` a `CentroAcopio` en `types.ts`**

Buscar la interfaz `CentroAcopio` (línea ~34) y agregar el campo después de `municipio_id`:

```ts
export interface CentroAcopio {
  id: string;
  nombre: string;
  direccion: string;
  municipio_id: string;
  estado_id: string | null;   // ← agregar esta línea
  estatus?: string;
  // ...resto sin cambios
}
```

- [ ] **Step 2: Mapear `estado_id` en `normalizeCentro` en `data.ts`**

Buscar la función `normalizeCentro` (línea ~161). Dentro del objeto retornado, agregar después de `municipio_id`:

```ts
estado_id: raw.estado_id ? String(raw.estado_id) : null,
```

El campo ya existe en el resultado de la query de Supabase (`estado_id` se selecciona explícitamente en `centros_acopio`), solo faltaba mapearlo.

- [ ] **Step 3: Verificar tipos**

```bash
cd /Users/simonmeza/Documents/helpVzla/donaciones-ve && npx tsc --noEmit
```

Esperado: sin errores. Si hay errores de tipo relacionados con `estado_id`, es que algún otro lugar construye un `CentroAcopio` literal — agregar `estado_id: null` donde sea necesario.

- [ ] **Step 4: Commit**

```bash
git add src/lib/types.ts src/lib/data.ts
git commit -m "feat: mapear estado_id en CentroAcopio"
```

---

## Task 2: `calcularSemafaroGrupo` + componente `CentroGrupoEstado`

**Files:**
- Modify: `src/lib/semaforo.ts`
- Create: `src/components/CentroGrupoEstado.tsx`

**Interfaces:**
- Consumes: `CentroAcopio` (con `estado_id` de Task 1), `calcularSemafaro`, `SEMAFORO_DOT`, `CentroCard`
- Produces:
  - `calcularSemafaroGrupo(centros: CentroAcopio[]): SemafaroEstado` — exportado desde `semaforo.ts`
  - `CentroGrupoEstado({ nombreEstado, centros, defaultOpen? })` — exportado desde `CentroGrupoEstado.tsx`

- [ ] **Step 1: Agregar `calcularSemafaroGrupo` a `semaforo.ts`**

Agregar al final del archivo `src/lib/semaforo.ts`:

```ts
const SEMAFORO_PRIORITY: Record<SemafaroEstado, number> = {
  URGENTE: 4,
  MEDIA: 3,
  SATURADO: 2,
  SIN_DATOS: 1,
};

export function calcularSemafaroGrupo(centros: CentroAcopio[]): SemafaroEstado {
  return centros.reduce<SemafaroEstado>((max, centro) => {
    const s = calcularSemafaro(centro.necesidades ?? []);
    return SEMAFORO_PRIORITY[s] > SEMAFORO_PRIORITY[max] ? s : max;
  }, "SIN_DATOS");
}
```

También agregar el import de `CentroAcopio` al inicio del archivo:

```ts
import type { CentroAcopio, Necesidad, SemafaroEstado, Urgencia } from "@/lib/types";
```

(Reemplaza la línea de import existente que no incluye `CentroAcopio`.)

- [ ] **Step 2: Verificar tipos de `semaforo.ts`**

```bash
cd /Users/simonmeza/Documents/helpVzla/donaciones-ve && npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 3: Crear `src/components/CentroGrupoEstado.tsx`**

```tsx
import { CentroCard } from "@/components/CentroCard";
import { calcularSemafaroGrupo, SEMAFORO_DOT, SEMAFORO_LABELS } from "@/lib/semaforo";
import type { CentroAcopio } from "@/lib/types";

interface CentroGrupoEstadoProps {
  nombreEstado: string;
  centros: CentroAcopio[];
  defaultOpen?: boolean;
}

export function CentroGrupoEstado({
  nombreEstado,
  centros,
  defaultOpen = false,
}: CentroGrupoEstadoProps) {
  const semaforo = calcularSemafaroGrupo(centros);

  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={`inline-block h-3 w-3 shrink-0 rounded-full ${SEMAFORO_DOT[semaforo]}`}
          />
          <span className="font-black text-zinc-900">{nombreEstado}</span>
          <span className="text-sm font-medium text-zinc-500">
            {centros.length}{" "}
            {centros.length === 1 ? "centro" : "centros"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500 sm:inline">
            {SEMAFORO_LABELS[semaforo]}
          </span>
          <svg
            className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="space-y-4 border-t border-zinc-100 p-4 sm:p-5">
        {centros.map((centro) => (
          <CentroCard key={centro.id} centro={centro} />
        ))}
      </div>
    </details>
  );
}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /Users/simonmeza/Documents/helpVzla/donaciones-ve && npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/lib/semaforo.ts src/components/CentroGrupoEstado.tsx
git commit -m "feat: componente CentroGrupoEstado y calcularSemafaroGrupo"
```

---

## Task 3: Agrupación en `HomeClient`

**Files:**
- Modify: `src/app/HomeClient.tsx`

**Interfaces:**
- Consumes:
  - `calcularSemafaroGrupo(centros: CentroAcopio[]): SemafaroEstado` de `@/lib/semaforo`
  - `CentroGrupoEstado({ nombreEstado, centros, defaultOpen? })` de `@/components/CentroGrupoEstado`
  - `estados: Estado[]` — ya disponible como prop en `HomeClient`
  - `centros: CentroAcopio[]` — ya disponible como prop
  - `initialFilters: HomeSearchFilters` — ya disponible como prop

- [ ] **Step 1: Agregar imports en `HomeClient.tsx`**

En la sección de imports de `src/app/HomeClient.tsx`, agregar:

```ts
import { CentroGrupoEstado } from "@/components/CentroGrupoEstado";
import { calcularSemafaroGrupo } from "@/lib/semaforo";
import type { SemafaroEstado } from "@/lib/types";
```

- [ ] **Step 2: Agregar la función `agruparCentrosPorEstado` como función de módulo**

Agregar esta función **fuera** del componente `HomeClient` (antes de la declaración `export function HomeClient`):

```ts
const SEMAFORO_PRIORITY: Record<SemafaroEstado, number> = {
  URGENTE: 4,
  MEDIA: 3,
  SATURADO: 2,
  SIN_DATOS: 1,
};

interface GrupoEstado {
  estadoId: string;
  nombre: string;
  centros: CentroAcopio[];
  semaforo: SemafaroEstado;
  defaultOpen: boolean;
}

function agruparCentrosPorEstado(
  centros: CentroAcopio[],
  estados: Estado[],
  hayFiltroActivo: boolean,
): GrupoEstado[] {
  const estadosMap = new Map(estados.map((e) => [e.id, e.nombre]));
  const mapaGrupos = new Map<string, CentroAcopio[]>();

  for (const centro of centros) {
    const key = centro.estado_id ?? "__sin_estado__";
    if (!mapaGrupos.has(key)) mapaGrupos.set(key, []);
    mapaGrupos.get(key)!.push(centro);
  }

  const grupos: GrupoEstado[] = [];
  for (const [estadoId, centrosGrupo] of mapaGrupos) {
    const nombre =
      estadoId === "__sin_estado__"
        ? "Sin estado"
        : (estadosMap.get(estadoId) ?? "Desconocido");
    const semaforo = calcularSemafaroGrupo(centrosGrupo);
    grupos.push({
      estadoId,
      nombre,
      centros: centrosGrupo,
      semaforo,
      defaultOpen: hayFiltroActivo,
    });
  }

  grupos.sort((a, b) => {
    if (a.estadoId === "__sin_estado__") return 1;
    if (b.estadoId === "__sin_estado__") return -1;
    return SEMAFORO_PRIORITY[b.semaforo] - SEMAFORO_PRIORITY[a.semaforo];
  });

  return grupos;
}
```

- [ ] **Step 3: Calcular grupos dentro del componente y reemplazar la sección de resultados**

Dentro de `HomeClient`, antes del `return`, agregar:

```ts
const hayFiltroActivo = Boolean(
  initialFilters.estadoId || initialFilters.municipioId || initialFilters.q,
);
const grupos = agruparCentrosPorEstado(centros, estados, hayFiltroActivo);
```

Luego reemplazar la sección `<section id="tour-results" ...>` (actualmente líneas ~325-335 en `HomeClient.tsx`):

```tsx
<section id="tour-results" aria-live="polite" className="space-y-2">
  {grupos.length === 0 ? (
    <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
      No hay centros registrados en Supabase para esta ubicación.
    </p>
  ) : (
    grupos.map((grupo) => (
      <CentroGrupoEstado
        key={grupo.estadoId}
        nombreEstado={grupo.nombre}
        centros={grupo.centros}
        defaultOpen={grupo.defaultOpen}
      />
    ))
  )}
</section>
```

- [ ] **Step 4: Verificar tipos**

```bash
cd /Users/simonmeza/Documents/helpVzla/donaciones-ve && npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 5: Verificar visualmente con el servidor de desarrollo**

```bash
cd /Users/simonmeza/Documents/helpVzla/donaciones-ve && npm run dev
```

Abrir `http://localhost:3000` en el navegador y verificar:

1. Los centros aparecen agrupados por estado en secciones colapsables.
2. Sin filtro: todos los grupos están cerrados por defecto.
3. Al hacer click en un grupo, se despliegan las tarjetas completas.
4. El punto de color del header refleja el semáforo más urgente del grupo.
5. Los filtros de texto, estado y municipio siguen funcionando.
6. Con filtro activo (por estado, municipio o texto): el/los grupo(s) se despliegan automáticamente.
7. El botón "Limpiar" vuelve a cerrar todos los grupos.

- [ ] **Step 6: Commit**

```bash
git add src/app/HomeClient.tsx
git commit -m "feat: agrupar centros por estado en home page"
```
