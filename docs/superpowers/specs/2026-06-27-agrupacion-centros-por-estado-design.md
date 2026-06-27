# Diseño: Agrupación de centros por estado

**Fecha:** 2026-06-27
**Branch:** feat-ftd-implementation

## Contexto

Con más de 70 centros de acopio registrados, la lista actual en `HomeClient.tsx` produce un scroll infinito en móvil que hace difícil orientarse. Los usuarios no suelen usar los filtros geográficos aunque deberían. La solución es agrupar los centros por estado usando secciones colapsables nativas (`<details>`), sin eliminar ningún filtro existente.

## Alcance

Solo se modifica la sección de resultados (`#tour-results`) en `HomeClient.tsx`. Los filtros, la búsqueda por texto, el bloque de contactos de emergencia y las `CentroCard` individuales quedan intactos.

## Cambios requeridos

### 1. Tipo `CentroAcopio` — agregar `estado_id`

El campo `estado_id` ya es seleccionado en la query de Supabase pero no está mapeado. Se debe agregar al tipo y al normalizador.

**`src/lib/types.ts`**
```ts
export interface CentroAcopio {
  // ...campos existentes...
  estado_id: string | null;  // nuevo campo
}
```

**`src/lib/data.ts`** — dentro de `normalizeCentro`:
```ts
estado_id: raw.estado_id ? String(raw.estado_id) : null,
```

### 2. Componente `CentroGrupoEstado`

Nuevo componente en `src/components/CentroGrupoEstado.tsx`.

**Responsabilidad única:** renderizar un `<details>` con el header del grupo (nombre del estado, cantidad de centros, semáforo más urgente) y las `CentroCard` dentro.

**Props:**
```ts
interface CentroGrupoEstadoProps {
  nombreEstado: string;
  centros: CentroAcopio[];
  defaultOpen?: boolean;
}
```

**Lógica del header:**
- Nombre del estado en negrita
- `N centros` como conteo
- Punto de color con el semáforo más urgente del grupo: se calcula tomando el `calcularSemafaro` de cada centro y seleccionando el más alto según la prioridad `URGENTE > MEDIA > SATURADO > SIN_DATOS`

**Markup:**
```html
<details open={defaultOpen}>
  <summary>
    <span>[dot semáforo]</span>
    <span>[nombre estado]</span>
    <span>[N centros]</span>
    <span>[ícono flecha]</span>
  </summary>
  <div>
    [lista de CentroCard]
  </div>
</details>
```

El `<details>` es HTML nativo — no requiere estado de React, funciona sin JS en clientes degradados, y es accesible por defecto.

### 3. Lógica de agrupación en `HomeClient`

En `HomeClient.tsx`, reemplazar el `.map()` plano de centros por lógica de agrupación:

**Agrupación:**
```ts
const grupos = agruparCentrosPorEstado(centros, estados);
```

Función pura (puede vivir en el mismo archivo o en `src/lib/data.ts`):
- Recorre `centros` y los agrupa por `centro.estado_id`
- Usa el array `estados` (ya disponible en `HomeClient`) para resolver el nombre
- Para centros sin `estado_id`, usa un grupo "Sin estado" al final
- Ordena los grupos por semáforo más urgente descendente: `URGENTE` primero, luego `MEDIA`, `SATURADO`, `SIN_DATOS`

**Apertura automática:**
- Si `estadoId` (filtro activo) coincide con el `estado_id` del grupo → `defaultOpen={true}`
- Si hay texto de búsqueda (`filters.q`) o `municipioId` activo → todos los grupos con resultados abren (`defaultOpen={true}`)
- Sin filtro activo → todos los grupos cerrados por defecto (`defaultOpen={false}`)

**Renderizado:**
```tsx
<section id="tour-results" aria-live="polite" className="space-y-2">
  {grupos.length === 0 ? (
    <p>No hay centros...</p>
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

### 4. Estilos del header del grupo

El summary sigue la paleta existente de Tailwind. Ejemplo de clases:
- Fondo: `bg-zinc-100 hover:bg-zinc-200` 
- Borde: `rounded-xl border border-zinc-200`
- Texto estado: `font-black text-zinc-900`
- Conteo: `text-sm text-zinc-500 font-medium`
- Punto semáforo: reutiliza `SEMAFORO_DOT` de `src/lib/semaforo.ts`
- Flecha: rotación CSS con `group-open:rotate-180` para el ícono `▾`

## Qué NO cambia

- `FiltroGeografico` — sin modificaciones
- Formulario GET de búsqueda — sin modificaciones
- `CentroCard` — sin modificaciones
- `SpotlightTour` — sin modificaciones
- Queries de Supabase — sin modificaciones
- Lógica de filtros en `HomeClient` — sin modificaciones
- Bloque de contactos de emergencia — sin modificaciones

## Comportamiento edge cases

| Caso | Comportamiento |
|------|----------------|
| Centro sin `estado_id` | Va a grupo "Sin estado" al final de la lista |
| Un solo estado con resultados | Se muestra un solo grupo, abierto si hay filtro activo |
| Búsqueda por texto devuelve centros de varios estados | Todos los grupos con resultados abren |
| Sin resultados | Mensaje vacío igual al actual |

## Archivos a modificar/crear

| Archivo | Acción |
|---------|--------|
| `src/lib/types.ts` | Agregar `estado_id: string \| null` a `CentroAcopio` |
| `src/lib/data.ts` | Mapear `estado_id` en `normalizeCentro` |
| `src/components/CentroGrupoEstado.tsx` | Crear nuevo componente |
| `src/app/HomeClient.tsx` | Reemplazar lista plana por lógica de grupos |
