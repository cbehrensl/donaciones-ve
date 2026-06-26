const DONAR_IFRAME_URL = process.env.DONAR_IFRAME_URL ?? "";

export default function DonarPage() {
  return (
    <main className="pt-1 h-screen flex flex-col">
      {DONAR_IFRAME_URL ? (
        <iframe
          src={DONAR_IFRAME_URL}
          className="flex-1 w-full border-0"
          title="Donar dinero"
          allow="fullscreen"
        />
      ) : (
        <p className="m-auto text-sm" style={{ color: "#0084D0" }}>
          Configura la variable de entorno <code>DONAR_IFRAME_URL</code> para mostrar el formulario de donación.
        </p>
      )}
    </main>
  );
}
