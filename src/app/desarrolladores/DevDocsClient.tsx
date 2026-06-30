"use client";

import { useState } from "react";
import Link from "next/link";

const BASE_URL = "https://apoyo-venezuela.com";

type Lang = "curl" | "js" | "python";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="rounded-md bg-zinc-700 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-600 hover:text-white"
    >
      {copied ? "✓ Copiado" : "Copiar"}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-2 overflow-hidden rounded-xl bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-700/50 px-4 py-2">
        <span className="text-xs text-zinc-500">código</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface EndpointProps {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; desc: string }[];
  fields: { name: string; type: string; desc: string }[];
  lang: Lang;
  base: string;
  example: Record<Lang, string>;
}

function Endpoint({ method, path, description, params, fields, lang, example }: EndpointProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-black tracking-wide text-emerald-700">
          {method}
        </span>
        <code className="font-mono text-sm font-semibold text-zinc-800">{path}</code>
      </div>
      <div className="space-y-5 p-5">
        <p className="text-sm text-zinc-600">{description}</p>

        {params && params.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-400">
              Parámetros opcionales
            </h3>
            <div className="overflow-hidden rounded-xl border border-zinc-100">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-zinc-500">Parámetro</th>
                    <th className="px-4 py-2 text-left font-semibold text-zinc-500">Tipo</th>
                    <th className="px-4 py-2 text-left font-semibold text-zinc-500">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {params.map((p) => (
                    <tr key={p.name} className="bg-white">
                      <td className="px-4 py-2 font-mono text-xs text-blue-700">{p.name}</td>
                      <td className="px-4 py-2 font-mono text-xs text-zinc-500">{p.type}</td>
                      <td className="px-4 py-2 text-xs text-zinc-600">{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-400">
            Campos en <code className="font-mono normal-case">data[]</code>
          </h3>
          <div className="overflow-hidden rounded-xl border border-zinc-100">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-500">Campo</th>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-500">Tipo</th>
                  <th className="px-4 py-2 text-left font-semibold text-zinc-500">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {fields.map((f) => (
                  <tr key={f.name} className="bg-white">
                    <td className="px-4 py-2 font-mono text-xs text-blue-700">{f.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-zinc-500">{f.type}</td>
                    <td className="px-4 py-2 text-xs text-zinc-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-black uppercase tracking-wider text-zinc-400">
            Ejemplo
          </h3>
          <CodeBlock code={example[lang]} />
        </div>
      </div>
    </section>
  );
}

export function DevDocsClient() {
  const [lang, setLang] = useState<Lang>("curl");
  const base = BASE_URL;

  const tabs: { id: Lang; label: string }[] = [
    { id: "curl", label: "cURL" },
    { id: "js", label: "JavaScript" },
    { id: "python", label: "Python" },
  ];

  const centrosExamples: Record<Lang, string> = {
    curl: `curl "${base}/api/v1/centros"`,
    js: `const res = await fetch("${base}/api/v1/centros");
const { data, count } = await res.json();
console.log(count + " centros");
// Filtrar por estado: /api/v1/centros?estado_id=VE-A
// Buscar por texto:   /api/v1/centros?q=agua`,
    python: `import httpx

r = httpx.get("${base}/api/v1/centros")
payload = r.json()
print(payload["count"], "centros")
for centro in payload["data"]:
    print(centro["nombre"], "-", centro["direccion"])

# Filtrar: httpx.get("${base}/api/v1/centros", params={"estado_id": "VE-A"})`,
  };

  const refugiosExamples: Record<Lang, string> = {
    curl: `curl "${base}/api/v1/refugios"`,
    js: `const res = await fetch("${base}/api/v1/refugios");
const { data, count } = await res.json();
console.log(count + " refugios");
// Filtrar por zona: /api/v1/refugios?zona=Norte
// Buscar:          /api/v1/refugios?q=comida`,
    python: `import httpx

r = httpx.get("${base}/api/v1/refugios")
payload = r.json()
for refugio in payload["data"]:
    print(refugio["nombre"], "-", refugio["municipio"])`,
  };

  const donacionesExamples: Record<Lang, string> = {
    curl: `curl "${base}/api/v1/donaciones"`,
    js: `const res = await fetch("${base}/api/v1/donaciones");
const { data } = await res.json();
data.forEach(link => console.log(link.title, link.url));`,
    python: `import httpx

r = httpx.get("${base}/api/v1/donaciones")
for link in r.json()["data"]:
    print(link["title"], link["url"])`,
  };

  const responseFormat = `{
  "ok": true,
  "data": [ /* arreglo de objetos */ ],
  "count": 42,
  "timestamp": "2026-06-29T00:00:00.000Z"
}`;

  const errorFormat = `{
  "ok": false,
  "error": "Error al obtener centros de acopio"
}`;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        ← Volver al inicio
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700 ring-1 ring-inset ring-blue-200">
          <span>🔌</span> API Pública · Solo lectura
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          API para Desarrolladores
        </h1>
        <p className="mt-3 text-base text-zinc-600">
          Datos en tiempo real de centros de acopio, refugios y links de donación verificados.
          Gratis, sin registro, acceso de solo lectura.
        </p>
      </header>

      {/* Base URL */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-black text-zinc-900">URL base</h2>
        <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3">
          <code className="flex-1 font-mono text-sm text-emerald-400 break-all">{base}/api/v1</code>
          <CopyButton text={`${base}/api/v1`} />
        </div>
        <ul className="mt-4 space-y-1.5 text-sm text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>Solo método <strong>GET</strong> — cualquier otro método devuelve <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">405</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>CORS abierto — funciona desde cualquier origen</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>Caché CDN de 60 s con revalidación en segundo plano</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-emerald-500">✓</span>
            <span>Respuesta siempre en JSON con <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">Content-Type: application/json</code></span>
          </li>
        </ul>
      </section>

      {/* Language selector */}
      <div className="mb-6 flex gap-2">
        <span className="self-center text-xs font-semibold text-zinc-400">Ejemplo en:</span>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setLang(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              lang === t.id
                ? "bg-blue-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        <Endpoint
          method="GET"
          path="/api/v1/centros"
          description="Devuelve todos los centros de acopio activos. Sin parámetros trae todo; puedes filtrar por estado, municipio o texto libre."
          lang={lang}
          base={base}
          params={[
            { name: "estado_id", type: "string", desc: "Filtra por ID del estado (ej. VE-A)" },
            { name: "municipio_id", type: "string", desc: "Filtra por ID del municipio" },
            { name: "q", type: "string", desc: "Búsqueda por nombre o dirección (máx. 80 chars)" },
          ]}
          fields={[
            { name: "id", type: "string", desc: "Identificador único" },
            { name: "nombre", type: "string", desc: "Nombre del centro" },
            { name: "direccion", type: "string", desc: "Dirección física" },
            { name: "municipio_id", type: "string", desc: "ID del municipio" },
            { name: "estado_id", type: "string | null", desc: "ID del estado" },
            { name: "estatus", type: "string", desc: "activo | saturado | sin_verificar" },
            { name: "ubicacion_url", type: "string | null", desc: "Enlace a Google Maps" },
            { name: "contacto", type: "string | null", desc: "Teléfono de contacto del centro" },
            { name: "estado_vialidad", type: "string | null", desc: "Condiciones de acceso vial" },
            { name: "horario_recepcion", type: "string | null", desc: "Horario de atención" },
            { name: "verificado", type: "boolean", desc: "Si fue verificado por el equipo" },
            { name: "municipios", type: "object | null", desc: "{ id, nombre, estado_id }" },
            { name: "necesidades", type: "array", desc: "Lista de insumos necesarios con urgencia" },
          ]}
          example={centrosExamples}
        />

        <Endpoint
          method="GET"
          path="/api/v1/refugios"
          description="Devuelve todos los refugios activos. Sin parámetros trae todo; puedes filtrar por zona o buscar por texto."
          lang={lang}
          base={base}
          params={[
            { name: "zona", type: "string", desc: "Filtra por zona exacta (ej. Norte, Sur)" },
            { name: "q", type: "string", desc: "Búsqueda por nombre, municipio, zona o necesidades" },
          ]}
          fields={[
            { name: "id", type: "string", desc: "Identificador único" },
            { name: "nombre", type: "string", desc: "Nombre del refugio" },
            { name: "direccion", type: "string | null", desc: "Dirección" },
            { name: "referencia_lugar", type: "string | null", desc: "Referencia o punto cercano" },
            { name: "zona", type: "string | null", desc: "Zona geográfica" },
            { name: "municipio", type: "string | null", desc: "Municipio" },
            { name: "contacto_nombre", type: "string | null", desc: "Nombre del responsable" },
            { name: "contacto_telefono", type: "string | null", desc: "Teléfono del responsable" },
            { name: "num_personas", type: "number | null", desc: "Número de personas albergadas" },
            { name: "necesidades", type: "string | null", desc: "Texto libre con necesidades" },
            { name: "confirmado", type: "boolean", desc: "Si fue confirmado por el equipo" },
            { name: "google_maps_url", type: "string | null", desc: "Enlace a Google Maps" },
          ]}
          example={refugiosExamples}
        />

        <Endpoint
          method="GET"
          path="/api/v1/donaciones"
          description="Devuelve todos los links de donación verificados y activos. No hay parámetros — trae todo."
          lang={lang}
          base={base}
          fields={[
            { name: "id", type: "string", desc: "Identificador único" },
            { name: "title", type: "string", desc: "Nombre de la organización o campaña" },
            { name: "description", type: "string", desc: "Descripción breve" },
            { name: "url", type: "string | null", desc: "Enlace a la página de donación" },
            { name: "whatsapp_phone", type: "string | null", desc: "Número para contacto por WhatsApp cuando no hay URL" },
            { name: "image_url", type: "string | null", desc: "Logo o imagen representativa" },
            { name: "country", type: "string | null", desc: "Código ISO 3166-1 del país (ej. VE, US, ES)" },
            { name: "is_active", type: "boolean", desc: "Siempre true en esta respuesta" },
          ]}
          example={donacionesExamples}
        />
      </div>

      {/* Response format */}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-black text-zinc-900">Formato de respuesta</h2>
        <p className="mb-3 text-sm text-zinc-600">
          Todas las respuestas usan la misma estructura:
        </p>
        <CodeBlock code={responseFormat} />
        <p className="mt-4 mb-2 text-sm text-zinc-600">En caso de error:</p>
        <CodeBlock code={errorFormat} />
      </section>

      {/* Footer note */}
      <footer className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-black">⚠️ Uso responsable</p>
        <p className="mt-1">
          Esta API es gratuita y sin autenticación. Por favor no hagas scraping masivo ni ataques
          de fuerza bruta. Los datos son de ayuda humanitaria — úsalos para el bien.
          Si tienes dudas o necesitas un volumen alto de peticiones, contáctanos.
        </p>
      </footer>

      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
