import Link from "next/link";
import { SnackbarForm } from "@/components/SnackbarForm";
import { SnackbarShell } from "@/components/SnackbarShell";
import { StaffNav } from "@/components/navigation/StaffNav";
import {
  CATEGORIA_PRODUCTOR_LABELS,
  familiaDeNecesidadCocina,
  necesidadCoincideConProductor,
} from "@/lib/categorias-alimentacion";
import { getProductoresParaModeracion, getCocinasParaModeracion } from "@/lib/data-productores";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";
import { isSupabaseServiceConfigured } from "@/lib/supabase";
import type { CategoriaProductor } from "@/lib/types";
import {
  verificarProductor,
  ocultarProductor,
  mostrarProductor,
  verificarCocina,
  ocultarCocina,
  mostrarCocina,
} from "./actions";

import { URGENCIA_STYLES } from "@/lib/semaforo";

export const revalidate = 15;

interface StaffProductoresPageProps {
  searchParams: Promise<{
    token?: string;
    tab?: string;
    verificacion?: string;
    q?: string;
  }>;
}

const CATEGORIAS_CRUCE = Object.keys(CATEGORIA_PRODUCTOR_LABELS) as CategoriaProductor[];

export default async function StaffProductoresPage({
  searchParams,
}: StaffProductoresPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const tab = params.tab ?? "productores";
  const verificacion = params.verificacion ?? "pendientes";
  const q = params.q?.trim() ?? "";

  const hasToken = Boolean(getModeratorAccessToken());
  const isAuthorized = isModeratorTokenValid(token);
  const hasService = isSupabaseServiceConfigured();

  const [{ productores, total: totalProductores }, { cocinas, total: totalCocinas }] =
    isAuthorized && hasService
      ? await Promise.all([
          getProductoresParaModeracion({ verificacion, q }),
          getCocinasParaModeracion({ verificacion, q }),
        ])
      : [
          { productores: [], total: 0 },
          { cocinas: [], total: 0 },
        ];

  const tabHref = (t: string) =>
    `/staff/productores?${new URLSearchParams({ token, tab: t, verificacion, ...(q ? { q } : {}) }).toString()}`;
  const verificacionHref = (v: string) =>
    `/staff/productores?${new URLSearchParams({ token, tab, verificacion: v, ...(q ? { q } : {}) }).toString()}`;

  const pendientesProductores = productores.filter((p) => !p.verificado && p.activo).length;
  const pendientesCocinas = cocinas.filter((c) => !c.verificado && c.activo).length;

  const productoresVerificados = productores.filter((p) => p.verificado && p.activo);
  const cocinasConDemanda = cocinas.filter(
    (c) => c.verificado && c.activo && (c.necesidades_cocina ?? []).length > 0,
  );

  if (!isAuthorized) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h1 className="text-xl font-black text-zinc-900">Acceso staff</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Ingresa el token de moderación.
          </p>
          <form method="get" action="/staff/productores" className="mt-4 space-y-3">
            <input
              type="password"
              name="token"
              required
              placeholder="Token de moderación"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-3 text-base"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white"
            >
              Entrar
            </button>
          </form>
          {!hasToken ? (
            <p className="mt-3 text-xs text-amber-800">
              Define <code>MODERADOR_ACCESS_TOKEN</code> en el servidor.
            </p>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <SnackbarShell>
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
        <StaffNav token={token} />

        <header className="mb-6 border-b border-zinc-200 pb-4">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-800">
            Panel de moderación
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
            Productores y cocinas
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Verifica productores y cocinas para publicarlos en búsqueda. Cruza la
            oferta con la demanda para canalizar donaciones.
          </p>
        </header>

        {verificacion === "pendientes" ? (
          <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Revisa pendientes primero</p>
            <p className="mt-1">
              Al verificar un registro, se publica en{" "}
              <code className="rounded bg-amber-100 px-1">/productores</code> o{" "}
              <code className="rounded bg-amber-100 px-1">/cocinas</code>. Los
              pendientes no aparecen en directorios públicos.
            </p>
          </section>
        ) : null}

        {/* Resumen */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center">
            <p className="text-2xl font-black text-zinc-900">{totalProductores}</p>
            <p className="text-xs font-bold uppercase text-zinc-500">Productores</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-2xl font-black text-amber-900">{pendientesProductores}</p>
            <p className="text-xs font-bold uppercase text-amber-700">Prod. pendientes</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center">
            <p className="text-2xl font-black text-zinc-900">{totalCocinas}</p>
            <p className="text-xs font-bold uppercase text-zinc-500">Cocinas</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <p className="text-2xl font-black text-amber-900">{pendientesCocinas}</p>
            <p className="text-xs font-bold uppercase text-amber-700">Cocinas pendientes</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <form method="get" className="flex flex-1 gap-2">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="tab" value={tab} />
            <input type="hidden" name="verificacion" value={verificacion} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre..."
              className="flex-1 rounded-lg border-2 border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-bold text-white"
            >
              Buscar
            </button>
          </form>

          <div className="flex gap-2">
            {["todos", "pendientes", "verificados"].map((v) => (
              <Link
                key={v}
                href={verificacionHref(v)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  verificacion === v
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {v === "todos" ? "Todos" : v === "pendientes" ? "Pendientes" : "Verificados"}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1">
          <Link
            href={tabHref("productores")}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-bold transition-colors ${
              tab === "productores"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Productores
            {pendientesProductores > 0 ? (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
                {pendientesProductores}
              </span>
            ) : null}
          </Link>
          <Link
            href={tabHref("cocinas")}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-bold transition-colors ${
              tab === "cocinas"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Cocinas
            {pendientesCocinas > 0 ? (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-white">
                {pendientesCocinas}
              </span>
            ) : null}
          </Link>
          <Link
            href={tabHref("cruce")}
            className={`flex-1 rounded-lg px-4 py-2 text-center text-sm font-bold transition-colors ${
              tab === "cruce"
                ? "bg-white shadow-sm text-zinc-900"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Vista de cruce
          </Link>
        </div>

        {/* Contenido por tab */}
        {tab === "productores" ? (
          <div className="space-y-2">
            {productores.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                No hay productores con ese filtro.
              </div>
            ) : (
              productores.map((productor) => {
                const isPending = !productor.verificado && productor.activo;
                return (
                  <details
                    key={productor.id}
                    className={`rounded-xl border bg-white shadow-sm ${
                      isPending
                        ? "border-amber-300"
                        : !productor.activo
                          ? "border-zinc-200 opacity-60"
                          : "border-emerald-200"
                    }`}
                    open={isPending}
                  >
                    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-zinc-900">{productor.nombre}</p>
                        <p className="text-xs text-zinc-500">
                          {productor.municipios?.nombre ?? "Sin municipio"} ·{" "}
                          {productor.categorias
                            .map((cat) => CATEGORIA_PRODUCTOR_LABELS[cat] ?? cat)
                            .join(", ") || "Sin categorías"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!productor.activo ? (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-700">
                            Oculto
                          </span>
                        ) : productor.verificado ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                            Verificado
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </summary>
                    <div className="space-y-3 border-t border-zinc-100 px-4 pb-4 pt-3">
                      {productor.descripcion ? (
                        <p className="text-sm text-zinc-600">{productor.descripcion}</p>
                      ) : null}
                      {productor.contacto ? (
                        <p className="text-sm">
                          <span className="font-bold text-zinc-500">Contacto:</span>{" "}
                          {productor.contacto}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {productor.verificado ? (
                          <SnackbarForm action={verificarProductor} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="productorId" value={productor.id} />
                            <input type="hidden" name="verificado" value="false" />
                            <button
                              type="submit"
                              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700"
                            >
                              Quitar verificación
                            </button>
                          </SnackbarForm>
                        ) : productor.activo ? (
                          <SnackbarForm action={verificarProductor} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="productorId" value={productor.id} />
                            <input type="hidden" name="verificado" value="true" />
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                            >
                              Verificar para publicar
                            </button>
                          </SnackbarForm>
                        ) : null}
                        {productor.activo ? (
                          <SnackbarForm action={ocultarProductor} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="productorId" value={productor.id} />
                            <button
                              type="submit"
                              className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                            >
                              Ocultar
                            </button>
                          </SnackbarForm>
                        ) : (
                          <SnackbarForm action={mostrarProductor} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="productorId" value={productor.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700"
                            >
                              Mostrar
                            </button>
                          </SnackbarForm>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })
            )}
          </div>
        ) : tab === "cocinas" ? (
          <div className="space-y-2">
            {cocinas.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                No hay cocinas con ese filtro.
              </div>
            ) : (
              cocinas.map((cocina) => {
                const necesidades = cocina.necesidades_cocina ?? [];
                const isPending = !cocina.verificado && cocina.activo;
                return (
                  <details
                    key={cocina.id}
                    className={`rounded-xl border bg-white shadow-sm ${
                      isPending
                        ? "border-amber-300"
                        : !cocina.activo
                          ? "border-zinc-200 opacity-60"
                          : "border-blue-200"
                    }`}
                    open={isPending}
                  >
                    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-zinc-900">{cocina.nombre}</p>
                        <p className="text-xs text-zinc-500">
                          {cocina.municipios?.nombre ?? "Sin municipio"} ·{" "}
                          {necesidades.length} necesidad{necesidades.length === 1 ? "" : "es"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!cocina.activo ? (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-black uppercase text-zinc-700">
                            Oculta
                          </span>
                        ) : cocina.verificado ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-800">
                            Verificada
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-800">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </summary>
                    <div className="space-y-3 border-t border-zinc-100 px-4 pb-4 pt-3">
                      <p className="text-sm text-zinc-600">{cocina.direccion}</p>
                      {necesidades.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {necesidades.map((n) => (
                            <span
                              key={n.id}
                              className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${URGENCIA_STYLES[n.urgencia]}`}
                              title={CATEGORIA_PRODUCTOR_LABELS[familiaDeNecesidadCocina(n.categoria)]}
                            >
                              {n.categoria} · {n.urgencia}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-800">
                          Sin necesidades reportadas — sugiere al responsable completar el panel.
                        </p>
                      )}
                      {cocina.contacto ? (
                        <p className="text-sm">
                          <span className="font-bold text-zinc-500">Contacto:</span>{" "}
                          {cocina.contacto}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {cocina.verificado ? (
                          <SnackbarForm action={verificarCocina} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="cocinaId" value={cocina.id} />
                            <input type="hidden" name="verificado" value="false" />
                            <button
                              type="submit"
                              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700"
                            >
                              Quitar verificación
                            </button>
                          </SnackbarForm>
                        ) : cocina.activo ? (
                          <SnackbarForm action={verificarCocina} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="cocinaId" value={cocina.id} />
                            <input type="hidden" name="verificado" value="true" />
                            <button
                              type="submit"
                              className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white"
                            >
                              Verificar para publicar
                            </button>
                          </SnackbarForm>
                        ) : null}
                        {cocina.activo ? (
                          <SnackbarForm action={ocultarCocina} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="cocinaId" value={cocina.id} />
                            <button
                              type="submit"
                              className="rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                            >
                              Ocultar
                            </button>
                          </SnackbarForm>
                        ) : (
                          <SnackbarForm action={mostrarCocina} className="inline-flex">
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="cocinaId" value={cocina.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-bold text-zinc-700"
                            >
                              Mostrar
                            </button>
                          </SnackbarForm>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })
            )}
          </div>
        ) : (
          /* Vista de cruce por categoría */
          <div className="space-y-6">
            <p className="text-sm text-zinc-600">
              Cruce agrupado por familia de categoría. Las necesidades de cocina se
              mapean a las mismas familias que usa el productor al registrarse.
            </p>

            {CATEGORIAS_CRUCE.map((categoria) => {
              const oferta = productoresVerificados.filter((p) =>
                p.categorias.includes(categoria),
              );
              const demanda = cocinasConDemanda
                .map((cocina) => ({
                  cocina,
                  necesidades: (cocina.necesidades_cocina ?? []).filter(
                    (n) => familiaDeNecesidadCocina(n.categoria) === categoria,
                  ),
                }))
                .filter((item) => item.necesidades.length > 0);

              if (oferta.length === 0 && demanda.length === 0) {
                return null;
              }

              const coincidencias = demanda.flatMap(({ cocina, necesidades }) => {
                const productoresMatch = oferta.filter((p) =>
                  necesidades.some((n) =>
                    necesidadCoincideConProductor(n.categoria, p.categorias),
                  ),
                );
                if (productoresMatch.length === 0) return [];
                return [{ cocina, necesidades, productoresMatch }];
              });

              return (
                <section
                  key={categoria}
                  className="rounded-xl border border-zinc-200 bg-white shadow-sm"
                >
                  <header className="border-b border-zinc-100 px-4 py-3">
                    <h2 className="text-base font-black text-zinc-900">
                      {CATEGORIA_PRODUCTOR_LABELS[categoria]}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {oferta.length} productor{oferta.length === 1 ? "" : "es"} ·{" "}
                      {demanda.length} cocina{demanda.length === 1 ? "" : "s"} con demanda
                      {coincidencias.length > 0
                        ? ` · ${coincidencias.length} cruce${coincidencias.length === 1 ? "" : "s"} directo${coincidencias.length === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </header>

                  <div className="grid gap-4 p-4 lg:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-800">
                        Oferta
                      </h3>
                      {oferta.length === 0 ? (
                        <p className="text-sm text-zinc-500">Sin productores en esta categoría.</p>
                      ) : (
                        <ul className="space-y-2">
                          {oferta.map((p) => (
                            <li
                              key={p.id}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm"
                            >
                              <p className="font-bold text-zinc-900">{p.nombre}</p>
                              <p className="text-xs text-zinc-500">{p.municipios?.nombre}</p>
                              {p.contacto ? (
                                <p className="mt-1 text-xs font-semibold">{p.contacto}</p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-blue-800">
                        Demanda
                      </h3>
                      {demanda.length === 0 ? (
                        <p className="text-sm text-zinc-500">Sin cocinas con esta necesidad.</p>
                      ) : (
                        <ul className="space-y-2">
                          {demanda.map(({ cocina, necesidades }) => (
                            <li
                              key={cocina.id}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm"
                            >
                              <p className="font-bold text-zinc-900">{cocina.nombre}</p>
                              <p className="text-xs text-zinc-500">{cocina.municipios?.nombre}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {necesidades.map((n) => (
                                  <span
                                    key={n.id}
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${URGENCIA_STYLES[n.urgencia]}`}
                                  >
                                    {n.categoria}
                                  </span>
                                ))}
                              </div>
                              {cocina.contacto ? (
                                <p className="mt-1 text-xs font-semibold">{cocina.contacto}</p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {coincidencias.length > 0 ? (
                    <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-3">
                      <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-600">
                        Cruces sugeridos
                      </h3>
                      <ul className="space-y-2">
                        {coincidencias.map(({ cocina, necesidades, productoresMatch }) => (
                          <li
                            key={cocina.id}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                          >
                            <p className="font-bold text-zinc-900">
                              {cocina.nombre} necesita{" "}
                              {necesidades.map((n) => n.categoria).join(", ")}
                            </p>
                            <p className="mt-1 text-xs text-zinc-600">
                              Productores que pueden aportar:{" "}
                              {productoresMatch.map((p) => p.nombre).join(" · ")}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </section>
              );
            })}

            {productoresVerificados.length === 0 && cocinasConDemanda.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                No hay oferta ni demanda verificada para cruzar aún.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </SnackbarShell>
  );
}
