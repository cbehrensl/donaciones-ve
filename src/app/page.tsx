import IframeDonar from "./IframeDonar";

const DONAR_IFRAME_URL = process.env.DONAR_IFRAME_URL ?? "";

export default function DonarPage() {
  if (!DONAR_IFRAME_URL) {
    return (
      <p className="m-auto text-sm" style={{ color: "#0084D0" }}>
        Configura la variable de entorno <code>DONAR_IFRAME_URL</code> para mostrar el formulario de donación.
      </p>
    );
  }

  return <IframeDonar src={DONAR_IFRAME_URL} />;
}
