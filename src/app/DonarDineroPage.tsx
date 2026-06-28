"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

// VE assets
const imgRectangle16 = "/donar/imgRectangle16.png";
const imgImage3      = "/donar/imgImage3.png";
const imgMercantil   = "/donar/imgMercantil.png";
const imgDividendo   = "/donar/dividendo.png";
const imgCaritasBanner = "/donar/caritas.png";
const imgJpMorgan    = "/donar/imgJpMorgan.png";
const imgQRCode      = "/donar/imgQRCode.png";
const imgWompi      = "/donar/qr_wompi.png";

// CO assets
const imgCaritasCol    = "/donar/caritas_col.png";
const imgBancolombia   = "/donar/bancolombia.png";
const imgBancoBogota   = "/donar/bancobogota.png";
const imgBrebLogo      = "/donar/breb_logo.png";
const imgQrBreb        = "/donar/qr_breb.png";
const imgQrPaypalCo    = "/donar/qr_paypal_co.png";
const imgPaypalLogo    = "/donar/paypal_logo.png";
const imgWompiLogo      = "/donar/wompi_logo.png";

const svgP1 = "M157.301 0L159.628 1.5623C162.786 3.61624 163.944 7.64218 164.572 11.3677C165.959 19.649 170.34 27.4441 178.349 30.8473C182.008 32.4042 186.674 31.7923 190.574 31.0385C203.416 28.5694 215.882 32.8794 223.939 43.2147C227.534 47.8306 231.166 52.9435 231.674 58.9087L232.701 70.91C233.204 76.8097 237.629 80.9012 243.659 80.7646C249.204 80.6335 254.519 79.7977 260.118 78.6779C279.084 74.8759 297.914 72.8165 317.328 73.1934C322.545 73.2972 327.401 74.417 332.061 76.5311C338.184 79.3061 343.865 82.5017 349.197 86.7516C364.798 99.179 386.108 102.227 404.205 93.4542C408.685 91.2801 412.793 88.7127 415.688 84.6321C418.583 80.5515 415.813 73.1825 422.024 72.8984L456.155 71.3471L510.153 67.7254L522.94 67.8182C523.53 67.8182 524.541 68.4355 524.803 68.7742C525.737 69.9814 523.104 72.598 520.876 72.9913L505.061 75.8045C500.14 76.6786 495.595 77.2849 490.504 77.1265C489.307 77.0883 487.657 78.1535 487.363 79.093C487.068 80.0326 487.668 82.2449 488.51 82.7912L494.956 86.9428C500.555 90.5481 498.015 101.424 508.656 103.811L534.887 109.689L552.968 115.097C558.431 116.73 563.183 119.866 567.706 123.28C575.327 129.038 581.27 141.17 576.556 145.518C572.89 148.9 573.142 153.985 576.676 157.656C581.401 162.573 588.311 165.337 595.413 165.397L609.042 165.517C614.149 165.834 618.214 168.838 619.279 173.864L620 174.792V180.255C618.673 185.876 615.417 190.967 610.113 193.868L603.416 197.528C598.259 200.346 593.566 203.482 590.038 208.196C584.679 215.358 581.401 226.731 589.863 230.068L600.034 234.083C600.897 234.422 601.99 236.045 602.148 236.886C602.328 237.831 601.4 239.945 600.553 240.486L591.119 246.484C586.771 249.248 582.335 251.957 577.293 253.301C573.24 254.383 569.285 255.437 565.871 257.709C560.523 261.271 558.076 267.231 559.097 273.42C560.228 280.264 552.783 279.314 551.51 282.488C551.133 283.422 551.794 285.716 552.499 286.557L564.669 301.202L584.559 323.834C589.251 329.171 591.66 335.513 586.591 340.26C584.564 342.156 582.1 343.434 579.615 344.756L561.823 354.255C543.349 364.115 519.084 373.719 498.424 376.029C493.366 376.597 489.411 378.482 486.98 383.333L482.31 392.646C480.578 396.104 477.175 397.677 473.69 395.924L462.797 390.45C450.698 384.365 431.431 386.288 406.035 371.768L396.978 365.082C396.661 364.847 395.411 364.454 395.247 364.782C394.181 366.989 398.317 375.685 400.977 378.449C405.97 383.65 411.378 387.599 416.928 392.084C419.501 394.165 422.39 396.683 423.155 400.054C425.597 410.821 419.943 417.113 425.384 426.258C431.841 437.101 426.706 444.41 431.174 448.261C433.742 450.474 437.385 451.375 440.81 451.238L455.559 450.648C458.504 450.528 460.394 452.211 460.7 454.969C461.317 460.579 458.667 465.081 453.609 467.364C446.715 470.483 439.532 472.439 432.032 473.548C429.006 473.996 427.421 476.825 428.033 479.698C430.016 489.001 424.204 497.272 414.732 498.397C407.417 499.266 401.053 502.199 395.427 506.826C388.123 512.835 382.382 507.918 379.269 513.113C377.378 516.271 375.248 519.111 372.391 521.52C369.682 523.798 367.994 526.442 366.213 529.539L362.771 535.33H360.537C356.304 531.768 362.837 526.622 357.522 521.897C353.922 518.696 348.804 517.472 344.177 518.947C336.748 521.318 340.298 528.906 339.473 531.003C338.239 534.139 324.353 526.065 318.89 522.891C312.8 519.351 307.37 515.484 302.737 510.06C300.394 507.317 298.793 504.002 297.559 500.533L290.119 479.556C288.256 474.296 286.47 468.866 286.634 463.278C286.748 459.514 286.765 456.149 284.006 453.374L272.901 442.198C264.15 433.392 253.159 434.84 252.766 431.802C252.667 431.043 253.35 429.213 254.126 428.814L265.941 422.718C278.183 416.403 276.167 404.014 271.786 391.423C271.24 389.855 269.252 388.905 267.739 389.484C265.007 390.521 262.123 389.484 261.249 386.496C259.364 380.061 258.354 373.418 257.955 366.546C257.491 358.554 256.48 350.945 254.994 343.183C252.727 331.34 255.431 320.458 261.932 310.593L274.72 291.19C276.79 288.049 277.178 283.957 275.621 280.434C272.868 274.19 264.958 273.07 258.037 274.523L231.461 280.122C223.388 281.821 215.232 281.515 207.033 280.898C203.87 280.658 201.084 280.745 198.085 281.668C190.328 284.05 181.648 286.486 177.944 280.374L167.828 263.696C163.195 256.065 157.749 249.269 151.478 242.977C149.845 241.332 147.272 241.043 145.387 242.01C139.04 245.271 136.226 239.355 128.628 236.919C124.296 235.531 119.959 236.629 116.692 239.601C112.988 242.971 108.198 243.348 103.735 240.895C93.0773 235.039 84.7741 238.049 73.4228 241.666C66.163 243.982 61.4434 240.42 57.9582 233.816C55.3744 228.916 51.7472 225.786 46.8145 223.584C41.4065 221.17 38.6151 215.008 40.68 209.54L43.5315 201.974C45.0173 198.025 44.5093 193.627 43.1054 189.585C40.4069 181.823 37.2386 174.585 33.9883 167.008C31.0604 160.174 28.99 153.346 27.6681 146.141C26.8815 141.875 23.451 139.744 19.4086 140.695C12.564 142.301 3.67087 144.945 0 142.082V139.296C1.8409 136.03 4.04233 133.113 6.53874 129.972C10.1004 125.492 12.493 120.319 14.1973 114.709C19.4687 97.3764 24.7948 80.4696 31.328 63.6066C33.1088 59.007 35.8893 55.1887 39.0849 51.6544C40.8439 49.7097 43.4714 48.4151 46.0825 48.3331C51.2611 48.1747 55.2269 45.4598 57.0514 40.5598L61.0282 29.8477C62.6888 25.3683 67.3648 22.5278 71.8005 21.0365L84.1186 16.8958C86.4785 16.1038 88.6253 14.5032 91.2091 14.5414C92.908 14.5688 94.8362 15.9781 95.1258 17.2564C95.3825 18.398 94.6232 20.6705 93.4925 21.3642C87.276 25.1771 80.3549 24.3304 73.2863 27.3622C69.1347 29.143 67.2556 33.2891 68.2989 37.7302C70.6315 47.6448 78.4812 55.0139 80.6608 60.8643C83.8073 69.3095 80.8301 78.5959 74.5864 84.9653C68.3426 91.3347 64.2675 98.8786 63.7486 108.176C63.1914 118.096 65.7479 128.032 71.1723 136.336C75.078 142.312 81.6386 145.218 88.5652 143.759C99.6488 141.421 108.793 133.801 106.493 121.761C103.855 107.963 98.092 95.3443 91.0561 83.2665C85.3641 73.4939 84.6048 62.809 94.6778 57.4229C98.9551 55.1341 103.571 54.0743 108.247 52.4628L137.45 42.3679L158.257 33.6879C160.808 32.6227 163.681 32.0709 165.845 30.3448C167.139 29.3069 166.232 26.8924 165.255 26.1986C161.791 23.735 157.694 28.2471 154.073 25.6524C147.479 20.9218 141.372 10.4172 146.103 5.12392C148.157 2.82417 150.959 1.32741 153.516 0H157.339L157.301 0Z";
const svgP2 = "M429.415 60.5749C422.341 56.5872 418.048 59.4714 412.121 55.0576C412.978 52.5831 415.901 51.7746 418.485 52.37C424.505 53.7521 428.82 58.1385 429.994 54.9047C430.737 52.8562 431.617 51.5452 433.004 50.103L436.883 46.0662L442.285 52.1898C442.968 52.9654 443.061 54.637 442.214 55.3526L437.38 59.4605C435.402 61.143 431.748 61.8913 429.415 60.5749Z";
const imgGroup2 = "data:image/svg+xml,%3Csvg%20preserveAspectRatio%3D%22none%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20overflow%3D%22visible%22%20style%3D%22display%3A%20block%3B%22%20viewBox%3D%220%200%20639%20292%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22639%22%20height%3D%22292%22%20fill%3D%22url(%23g)%22%2F%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%22441.559%22%20y1%3D%2254%22%20x2%3D%22406.66%22%20y2%3D%22505.478%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20stop-color%3D%22%23418FDE%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%238DBBEB%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3C%2Fsvg%3E";

const hv = "Helvetica, 'Helvetica Neue', Arial, sans-serif";

/* ── Hooks ─────────────────────────────────────────────────────── */

function useCopy(value: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {
      const ta = Object.assign(document.createElement("textarea"), { value });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

/* ── Copy fields ───────────────────────────────────────────────── */

function CopyField({ label, value, copyValue, withLogo = false, logoOverride }: { label: string; value: string; copyValue?: string; withLogo?: boolean; logoOverride?: string }) {
  const { copied, copy } = useCopy(copyValue ?? value);
  const logoSrc = logoOverride ?? (withLogo ? imgMercantil : null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="d-label" style={{ fontFamily: hv, color: "#7d8189", lineHeight: "18px", letterSpacing: "0.03em" }}>{label}</span>
      <button onClick={copy} className="d-field" style={{ display: "flex", alignItems: "center", background: "white", border: `1px solid ${copied ? "#418fde" : "#e9eaeb"}`, borderRadius: 8, padding: "0 8px 0 12px", cursor: "pointer", gap: 8, width: "100%", textAlign: "left", transition: "border-color 0.15s", outline: "none", boxSizing: "border-box" }} title="Toca para copiar">
        <span className="d-field-text" style={{ fontFamily: hv, color: "#001e62", lineHeight: "24px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
        {logoSrc && (
          <div style={{ height: 28, width: 80, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        )}
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {copied ? <Check size={16} color="#418fde" /> : <Copy size={16} color="#7D8189" />}
        </span>
      </button>
    </div>
  );
}

function CopyFieldHalf({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <span className="d-label" style={{ fontFamily: hv, color: "#7d8189", lineHeight: "18px", letterSpacing: "0.03em" }}>{label}</span>
      <button onClick={copy} className="d-field" style={{ display: "flex", alignItems: "center", background: "white", border: `1px solid ${copied ? "#418fde" : "#e9eaeb"}`, borderRadius: 8, padding: "0 6px 0 10px", cursor: "pointer", gap: 4, width: "100%", textAlign: "left", transition: "border-color 0.15s", outline: "none", boxSizing: "border-box" }} title="Toca para copiar">
        <span className="d-field-text-half" style={{ fontFamily: hv, color: "#001e62", lineHeight: "20px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {copied ? <Check size={14} color="#418fde" /> : <Copy size={14} color="#7D8189" />}
        </span>
      </button>
    </div>
  );
}

function CopyFieldMultiline({ label, value }: { label: string; value: string }) {
  const { copied, copy } = useCopy(value);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="d-label" style={{ fontFamily: hv, color: "#7d8189", lineHeight: "18px", letterSpacing: "0.03em" }}>{label}</span>
      <button onClick={copy} style={{ display: "flex", alignItems: "flex-start", background: "white", border: `1px solid ${copied ? "#418fde" : "#e9eaeb"}`, borderRadius: 8, padding: "10px 8px 10px 12px", cursor: "pointer", gap: 8, width: "100%", textAlign: "left", transition: "border-color 0.15s", outline: "none", boxSizing: "border-box" }} title="Toca para copiar">
        <span className="d-ml-text" style={{ fontFamily: hv, color: "#001e62", lineHeight: "22px", flex: 1 }}>{value}</span>
        <span style={{ flexShrink: 0, display: "flex", alignItems: "center", paddingTop: 3 }}>
          {copied ? <Check size={16} color="#418fde" /> : <Copy size={16} color="#7D8189" />}
        </span>
      </button>
    </div>
  );
}

function BankIntermediario() {
  const { copied, copy } = useCopy("JP MORGAN CHASE BANK");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="d-label" style={{ fontFamily: hv, color: "#7d8189", lineHeight: "18px", letterSpacing: "0.03em" }}>BANCO INTERMEDIARIO</span>
      <button onClick={copy} className="d-field" style={{ display: "flex", alignItems: "center", background: "white", border: `1px solid ${copied ? "#418fde" : "#e9eaeb"}`, borderRadius: 8, padding: "0 8px 0 12px", cursor: "pointer", gap: 8, width: "100%", textAlign: "left", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}>
        <span className="d-field-text" style={{ fontFamily: hv, color: "#001e62", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>JP MORGAN CHASE BANK</span>
        <div className="d-jpmorgan" style={{ position: "relative", flexShrink: 0, overflow: "hidden" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgJpMorgan} alt="JP Morgan" style={{ position: "absolute", height: "186.67%", left: "-0.11%", top: "-46.67%", width: "100.22%", maxWidth: "none" }} />
        </div>
        <span style={{ flexShrink: 0, display: "flex" }}>
          {copied ? <Check size={16} color="#418fde" /> : <Copy size={16} color="#7D8189" />}
        </span>
      </button>
    </div>
  );
}

/* ── Tab selector ──────────────────────────────────────────────── */

function TabSelector({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="d-tabs" style={{ background: "#ecf3fb", borderRadius: 18, display: "flex", alignItems: "center", padding: 4, gap: 3, boxSizing: "border-box", overflowX: "auto", scrollbarWidth: "none" }}>
      {tabs.map((tab, i) => (
        <button key={tab} onClick={() => onChange(i)} className="d-tab" style={{ background: active === i ? "#001e62" : "transparent", color: active === i ? "white" : "#99a5c0", border: "none", borderRadius: 14, fontFamily: hv, fontWeight: active === i ? "bold" : "normal", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", outline: "none" }}>
          {tab}
        </button>
      ))}
    </div>
  );
}

/* ── Card content ──────────────────────────────────────────────── */

function CaritasEmergenciaContent() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <TabSelector tabs={["PAGO MÓVIL", "TRANSFERENCIA", "DIVISAS", "ZELLE"]} active={tab} onChange={setTab} />
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 13 }}>
        {tab === 0 && (<><CopyField label="BANCO" value="MERCANTIL" withLogo /><CopyField label="RIF" value="J-000579105" copyValue="000579105" /><CopyField label="TELÉFONO" value="04123321367" /></>)}
        {tab === 1 && (<><CopyField label="BANCO" value="MERCANTIL" withLogo /><CopyField label="TITULAR" value="DIVIDENDO VOLUNTARIO PARA LA COMUNIDAD, A.C" /><CopyField label="TIPO DE CUENTA" value="CORRIENTE" /><CopyField label="NÚMERO DE CUENTA" value="01050026541026424518" /><CopyField label="RIF" value="J-000579105" /></>)}
        {tab === 2 && (<><CopyField label="BANCO" value="MERCANTIL" withLogo /><CopyField label="TITULAR" value="DIVIDENDO VOLUNTARIO PARA LA COMUNIDAD, A.C" /><CopyField label="SWIFT" value="MPANPAPA" /><CopyField label="NÚMERO DE CUENTA" value="300016658" /><CopyFieldMultiline label="DIRECCIÓN" value="TORRE DE LAS AMÉRICAS, PUNTA PACÍFICA, CIUDAD DE PANAMÁ, PANAMÁ" /></>)}
        {tab === 3 && (<CopyField label="CORREO" value="Administracion@dividendovoluntario.org" />)}
      </div>
      <p style={{ marginTop: 18, fontFamily: hv, fontSize: 13, color: "#7d8189", lineHeight: "18px" }}>No es necesario enviar comprobante.</p>
    </>
  );
}

function ACCaritasContent() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <TabSelector tabs={["TRANSFERENCIA", "EXTRANJERO","PAYPAL"]} active={tab} onChange={setTab} />
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 13 }}>
        {tab === 0 && (<><CopyField label="BANCO" value="MERCANTIL" withLogo /><CopyField label="TITULAR" value="A.C CARITAS DE VENEZUELA" /><CopyField label="TIPO DE CUENTA" value="CORRIENTE" /><CopyField label="NÚMERO DE CUENTA" value="01050699921699059454" /><CopyField label="RIF" value="J-304856970" /></>)}
        {tab === 1 && (<><BankIntermediario /><CopyField label="NOMBRE DE LA CUENTA" value="INSTITUTO PER LE OPERE DI RELIGIONE" /><CopyFieldMultiline label="DIRECCIÓN" value="4 CHASE METRO TECH, 7TH FLOOR, 11245 BROOKLYN NEW YORK, U.S.A" /><div style={{ display: "flex", gap: 10 }}><CopyFieldHalf label="COD. SWIFT" value="CHASUS33XXX" /><CopyFieldHalf label="FED WIRE" value="021000021" /></div><div style={{ display: "flex", gap: 10 }}><CopyFieldHalf label="COD. SWIFT" value="IOPRVAVX" /><CopyFieldHalf label="NÚMERO DE CUENTA" value="41563002" /></div><CopyField label="A FAVOR DE" value="CARITAS DE VENEZUELA" /></>)}
        {tab === 2 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgPaypalLogo} alt="PayPal" style={{ height: 40, width: "auto", objectFit: "contain" }} />
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Copia el siguiente correo </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <CopyFieldHalf label="Correo" value="prensacaritasvenezuela@gmail.com" />
            </div>
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Continua en esta <a target="_blank" href="https://www.paypal.com/ncp/payment/ZSSSATY2E654Y"> URL</a></p>
            </div>
          </div>
        )}
      </div>
      <p style={{ marginTop: 18, fontFamily: hv, fontSize: 13, color: "#7d8189", lineHeight: "18px" }}>No es necesario enviar comprobante.</p>
    </>
  );
}

/* ── Card headers ──────────────────────────────────────────────── */

function CaritasEmergenciaHeader() {
  return (
    <div className="d-card-header" style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgDividendo} alt="Dividendo Voluntario para la Comunidad" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

function ACCaritasHeader() {
  return (
    <div className="d-card-header" style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgCaritasBanner} alt="Cáritas Venezuela" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

/* ── HowTo ─────────────────────────────────────────────────────── */

function HowToStatic() {
  return (
    <div style={{ position: "relative", background: "#ecf3fb", border: "1px solid #418fde", borderRadius: 20, overflow: "hidden", display: "flex", minHeight: 160 }}>
      <div style={{ width: "38%", flexShrink: 0, position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={imgRectangle16} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg, rgba(236,243,251,0) 60%, rgb(236,243,251) 100%)" }} />
      </div>
      <div style={{ padding: "20px 24px 20px 20px" }}>
        <p style={{ fontFamily: hv, fontWeight: "bold", fontSize: 18, color: "#001e62", lineHeight: "24px", margin: "0 0 10px" }}>¿Cómo donar?</p>
        <ol style={{ fontFamily: hv, fontSize: 15, color: "#272d3b", lineHeight: "24px", margin: 0, paddingLeft: 22 }}>
          <li>Elije un país y una ONG a la que donar.</li>
          <li>Selecciona el método de pago.</li>
          <li>Toca cualquier campo para copiarlo.</li>
          <li>Realiza el pago desde tu app bancaria.</li>
          <li>¡Listo! No necesitas enviarnos comprobante.</li>
        </ol>
      </div>
    </div>
  );
}

function HowToAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#ecf3fb", border: "1px solid #418fde", borderRadius: 16, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", outline: "none" }}>
        <span style={{ fontFamily: hv, fontWeight: "bold", fontSize: 16, color: "#001e62" }}>¿Cómo donar?</span>
        {open ? <ChevronUp size={18} color="#418fde" /> : <ChevronDown size={18} color="#418fde" />}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <ol style={{ fontFamily: hv, fontSize: 14, color: "#272d3b", lineHeight: "22px", margin: 0, paddingLeft: 20 }}>
            <li>1. Elije una ONG a la que donar.</li>
            <li>2. Selecciona el método de pago.</li>
            <li>3. Toca cualquier campo para copiarlo.</li>
            <li>4. Realiza el pago desde tu app bancaria.</li>
            <li>5. ¡Listo! No necesitas enviarnos comprobante.</li>
          </ol>
        </div>
      )}
    </div>
  );
}

/* ── CO card components ────────────────────────────────────────── */

function BankToggle({ banks, active, onChange }: { banks: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {banks.map((bank, i) => (
        <button
          key={bank}
          onClick={() => onChange(i)}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 12,
            border: "2px solid #418fde",
            background: active === i ? "#418fde" : "white",
            color: active === i ? "white" : "#418fde",
            fontFamily: hv, fontWeight: "bold", fontSize: 13,
            cursor: "pointer", transition: "all 0.18s", outline: "none",
          }}
        >
          {bank}
        </button>
      ))}
    </div>
  );
}

function CaritasColContent() {
  const [tab, setTab] = useState(0);
  const [bank, setBank] = useState(0);
  return (
    <>
      <p style={{ fontFamily: hv, fontSize: 13, color: "#272d3b", lineHeight: "21px", margin: "0 0 16px" }}>
        Cáritas Colombiana es el organismo social de la Iglesia Católica en Colombia con más de 70 años de servicio. Dedicado a brindar ayuda humanitaria y apoyar a las comunidades más vulnerables.
      </p>
      <TabSelector tabs={["TRANSFERENCIA", "BRE-B", "EXTERIOR", "PSE-NEQUI", "PAYPAL"]} active={tab} onChange={setTab} />
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 13 }}>
        {tab === 0 && (
          <>
            <BankToggle banks={["Bancolombia", "Banco de Bogotá"]} active={bank} onChange={setBank} />
            {bank === 0 && (
              <>
                <CopyField label="BANCO" value="BANCOLOMBIA" withLogo logoOverride={imgBancolombia} />
                <div style={{ display: "flex", gap: 10 }}>
                  <CopyFieldHalf label="TIPO DE CUENTA" value="AHORROS" />
                  <CopyFieldHalf label="NÚMERO DE CUENTA" value="82900024657" />
                </div>
                <CopyFieldMultiline label="A NOMBRE DE" value="SECRETARIADO NACIONAL DE PASTORAL SOCIAL- CÁRITAS COLOMBIANA" />
                <CopyField label="NIT" value="860039273" />
              </>
            )}
            {bank === 1 && (
              <>
                <CopyField label="BANCO" value="BANCO DE BOGOTÁ" withLogo logoOverride={imgBancoBogota} />
                <div style={{ display: "flex", gap: 10 }}>
                  <CopyFieldHalf label="TIPO DE CUENTA" value="AHORROS" />
                  <CopyFieldHalf label="NÚMERO DE CUENTA" value="081789224" />
                </div>
                <CopyFieldMultiline label="A NOMBRE DE" value="SECRETARIADO NACIONAL DE PASTORAL SOCIAL- CÁRITAS COLOMBIANA" />
                <CopyField label="NIT" value="8600392733" />
              </>
            )}
          </>
        )}
        {tab === 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 4 }}>
            <div className="d-breb-logo" style={{ position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgBrebLogo} alt="Bre-B" style={{ position: "absolute", height: "159.79%", left: "-19.13%", top: "-22.75%", width: "146.99%", maxWidth: "none" }} />
            </div>
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 11, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgQrBreb} alt="QR Bre-B" style={{ width: "100%", maxWidth: 270, height: "auto", borderRadius: 8, display: "block", margin: "0 auto" }} />
              <span style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "20px", fontWeight: "bold" }}>ESCANEA</span>
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Confirma que la cuenta esté a nombre de <span style={{ fontWeight: "bold" }}>DONACIONES CÁRITAS COLOMBIA</span></p>
            </div>
            <CopyField label="CÓDIGO BRE-B" value="0092651552" />
            <a href={imgQrBreb} download="qr-bre-b-caritas-colombia.png" style={{ display: "flex", alignItems: "center", gap: 8, background: "#001e62", color: "white", borderRadius: 12, padding: "10px 20px", fontFamily: hv, fontSize: 14, textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Descargar QR
            </a>
          </div>
        )}
        {tab === 2 && (
          <>
            <CopyField label="BANCO INTERMEDIARIO" value="BANCO DE BOGOTÁ" withLogo logoOverride={imgBancoBogota} />
            <CopyFieldMultiline label="ASIGNADA A" value="DONACIONES CARITAS COLOMBIANA" />
            <div style={{ display: "flex", gap: 10 }}>
              <CopyFieldHalf label="CUENTA" value="AHORROS" />
              <CopyFieldHalf label="TELEFONOS SNPS-CC" value="3132185263" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <CopyFieldHalf label="NÚMERO DE CUENTA" value="081789224" />
              <CopyFieldHalf label="SUCURSAL BANCO" value="SIETE DE AGOSTO" />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <CopyFieldHalf label="SWIFT" value="BBOGCOBB" />
              <CopyFieldHalf label="CHIPS" value="001959" />
            </div>
            <CopyFieldMultiline label="DIRECCIÓN BANCO" value="CRA. 24 No. 65-35 SUCURSAL SIETE DE AGOSTO, BOGOTÁ - COLOMBIA" />
          </>
        )}
        {tab === 3 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgWompiLogo} alt="Wompi" style={{ height: 40, width: "auto", objectFit: "contain" }} />
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgWompi} alt="QR Wompi" style={{ width: "100%", maxWidth: 240, height: "auto", aspectRatio: "1", objectFit: "contain", borderRadius: 8 }} />
              <span style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "20px", fontWeight: "bold" }}>ESCANEA</span>
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Confirma que la cuenta destino sea <span style={{ fontWeight: "bold" }}>SECRETARIADO NACIONAL DE PASTORAL SOCIAL CARITAS COLOMBIANA</span> </p>
            </div>
          </div>
        )}
        {tab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgPaypalLogo} alt="PayPal" style={{ height: 40, width: "auto", objectFit: "contain" }} />
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Copia el siguiente correo </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <CopyFieldHalf label="Correo" value="prensacaritasvenezuela@gmail.com" />
            </div>
            <div style={{ border: "1px solid #418fde", borderRadius: 20, padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "100%", boxSizing: "border-box" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <p style={{ fontFamily: hv, fontSize: 14, color: "#001e62", lineHeight: "16px", textAlign: "center" }}>Continua en esta <a target="_blank" href="https://www.paypal.com/ncp/payment/ZSSSATY2E654Y"> URL</a></p>
            </div>
          </div>
        )}
      </div>
      <p style={{ marginTop: 18, fontFamily: hv, fontSize: 13, color: "#7d8189", lineHeight: "18px" }}>No es necesario enviar comprobante.</p>
    </>
  );
}

function CaritasColHeader() {
  return (
    <div className="d-card-header" style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgCaritasCol} alt="Cáritas Colombiana" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

function DividendoColContent() {
  const [tab, setTab] = useState(0);
  return (
    <>
      <p style={{ fontFamily: hv, fontSize: 13, color: "#272d3b", lineHeight: "21px", margin: "0 0 16px" }}>
        El Dividendo Voluntario para la Comunidad (DVC) es una asociación civil venezolana sin fines de lucro. Forma parte de la red internacional United Way y cuenta con más de 60 años de trayectoria mejorando la calidad de vida de las comunidades.
      </p>
      <TabSelector tabs={["ZELLE - DVC Venezuela", "DIVISAS"]} active={tab} onChange={setTab} />
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 13 }}>
        {tab === 0 && <CopyField label="ZELLE" value="Administracion@dividendovoluntario.org" />}
        {tab === 1 && (
          <>
            <CopyField label="BANCO" value="MERCANTIL" withLogo />
            <CopyFieldMultiline label="TITULAR" value="DIVIDENDO VOLUNTARIO PARA LA COMUNIDAD, A.C" />
            <CopyField label="SWIFT" value="MPANPAPA" />
            <CopyField label="NÚMERO DE CUENTA" value="300016658" />
            <CopyFieldMultiline label="DIRECCIÓN" value="TORRE DE LAS AMÉRICAS, PUNTA PACÍFICA, CIUDAD DE PANAMÁ, PANAMÁ" />
          </>
        )}
      </div>
      <p style={{ marginTop: 18, fontFamily: hv, fontSize: 13, color: "#7d8189", lineHeight: "18px" }}>No es necesario enviar comprobante.</p>
    </>
  );
}

function DividendoColHeader() {
  return (
    <div className="d-card-header" style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgDividendo} alt="Dividendo Voluntario para la Comunidad" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    </div>
  );
}

/* ── Layouts ───────────────────────────────────────────────────── */

function FluidLayout({ pais }: { pais: string }) {
  const isVE = pais === "VE";
  return (
    <div style={{ background: "#f4f4f5", overflowX: "hidden" }}>
      {/* Info band */}
      <div className="d-band" style={{ background: "#d9e8f8", textAlign: "center" }}>
        <p className="d-band-sub" style={{ fontFamily: hv, color: "#001e62", lineHeight: "22px", margin: "0 0 6px" }}>
          Elige la ONG a la que deseas apoyar y selecciona el método de pago de tu preferencia.
        </p>
        <p className="d-band-main" style={{ fontFamily: hv, fontWeight: "bold", color: "#001e62", lineHeight: "26px", margin: 0 }}>
          Cada aporte, sin importar el monto, ayuda a quienes más lo necesitan.
        </p>
      </div>

      {/* HowTo — accordion on mobile, static on tablet+ */}
      <div className="d-howto-gap" />
      <div className="d-howto-wrap">
        <div className="d-show-mobile"><HowToAccordion /></div>
        <div className="d-show-tablet"><HowToStatic /></div>
      </div>

      {/* Cards */}
      <div className="d-cards">
        {isVE ? (
          <>
            <div className="d-card-item">
              <div style={{ background: "white", borderRadius: 20, boxShadow: "0px 4px 18px rgba(0,0,0,0.14)" }}>
                <CaritasEmergenciaHeader />
                <div className="d-card-body"><CaritasEmergenciaContent /></div>
              </div>
            </div>
            <div className="d-card-item">
              <div style={{ background: "white", borderRadius: 20, boxShadow: "0px 4px 18px rgba(0,0,0,0.14)" }}>
                <ACCaritasHeader />
                <div className="d-card-body"><ACCaritasContent /></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="d-card-item">
              <div style={{ background: "white", borderRadius: 20, boxShadow: "0px 4px 18px rgba(0,0,0,0.14)" }}>
                <CaritasColHeader />
                <div className="d-card-body"><CaritasColContent /></div>
              </div>
            </div>
            <div className="d-card-item">
              <div style={{ background: "white", borderRadius: 20, boxShadow: "0px 4px 18px rgba(0,0,0,0.14)" }}>
                <DividendoColHeader />
                <div className="d-card-body"><DividendoColContent /></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer — tablet+ only */}
      <div className="d-footer">
        <div style={{ background: "linear-gradient(180deg, rgb(65,143,222) 0%, rgb(141,187,235) 100%)", padding: "48px 24px 36px" }}>
          <p style={{ fontFamily: hv, fontWeight: "bold", fontSize: 28, color: "#001e62", lineHeight: "38px", margin: "0 0 12px", maxWidth: 520 }}>
            Hoy, más que nunca, tu solidaridad puede hacer la diferencia.
          </p>
          <p style={{ fontFamily: hv, fontSize: 18, color: "#001e62", lineHeight: "26px", margin: 0 }}>
            {isVE ? "Gracias por tu apoyo a Venezuela." : "Gracias por tu apoyo a Venezuela."}
          </p>
        </div>
        <div style={{ background: "#001e62", height: 64 }} />
      </div>
    </div>
  );
}

function DesktopLayout({ pais }: { pais: string }) {
  if (pais !== "VE") return <DesktopLayoutCO />;
  return (
    <div style={{ width: "100%", background: "#f4f4f5", overflowX: "hidden" }}>
      <div style={{ width: 1280, minHeight: 1670, position: "relative", background: "#f4f4f5", margin: "0 auto" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 194, background: "#d9e8f8" }} />
        <div style={{ position: "absolute", left: "50%", top: 70, transform: "translate(-50%,-50%)", fontFamily: hv, fontSize: 16, color: "#001e62", textAlign: "center", lineHeight: "24px", whiteSpace: "nowrap" }}>
          Elige la ONG a la que deseas apoyar y selecciona el método de pago de tu preferencia.
        </div>
        <div style={{ position: "absolute", left: "50%", top: 94, transform: "translate(-50%,-50%)", fontFamily: hv, fontWeight: "bold", fontSize: 24, color: "#001e62", textAlign: "center", lineHeight: "32px", whiteSpace: "nowrap" }}>
          Cada aporte, sin importar el monto, ayuda a quienes más lo necesitan.
        </div>
        <div style={{ position: "absolute", left: 201, top: 140, width: 878, height: 197 }}>
          <div style={{ position: "absolute", inset: 0, background: "#ecf3fb", borderRadius: 20 }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: 338, height: 197, borderRadius: "20px 0 0 20px", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={imgRectangle16} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
          </div>
          <div style={{ position: "absolute", left: 182, top: 0, width: 162, height: 196, backgroundImage: "linear-gradient(93.83deg, rgba(236,243,251,0) 5.83%, rgb(236,243,251) 79.38%)" }} />
          <div style={{ position: "absolute", inset: 0, border: "1px solid #418fde", borderRadius: 20, pointerEvents: "none" }} />
          <p style={{ position: "absolute", left: 383, top: 22, fontFamily: hv, fontWeight: "bold", fontSize: 20, color: "#001e62", lineHeight: "24px", margin: 0 }}>¿Cómo donar?</p>
          <ol style={{ position: "absolute", left: 383, top: 55, width: 458, fontFamily: hv, fontSize: 16, color: "#272d3b", lineHeight: "24px", margin: 0, paddingLeft: 24 }}>
            <li>Elije un país y una ONG a la que donar.</li>
            <li>Selecciona el método de pago.</li>
            <li>Toca cualquier campo para copiarlo.</li>
            <li>Realiza el pago desde tu app bancaria.</li>
            <li>¡Listo! No necesitas enviarnos comprobante.</li>
          </ol>
        </div>
        <div style={{ position: "absolute", left: 68, top: 391, width: 524, background: "white", borderRadius: 20, boxShadow: "0px 4px 22.1px 0px rgba(0,0,0,0.18)" }}>
          <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", height: 174 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgDividendo} alt="Dividendo" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ padding: "25px 16px 24px" }}><CaritasEmergenciaContent /></div>
        </div>
        <div style={{ position: "absolute", left: 688, top: 391, width: 524, background: "white", borderRadius: 20, boxShadow: "0px 4px 22.1px 0px rgba(0,0,0,0.18)" }}>
          <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", height: 174 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgCaritasBanner} alt="Cáritas" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ padding: "25px 16px 24px" }}><ACCaritasContent /></div>
        </div>
        <div style={{ position: "absolute", left: 0, top: 1300, width: 1280, height: 292, backgroundImage: "linear-gradient(182.21deg, rgb(65,143,222) 20.29%, rgb(141,187,235) 153.32%)" }} />
        <div style={{ position: "absolute", left: 688, top: 1300, width: 592, height: 292, WebkitMaskImage: `url("${imgGroup2}")`, maskImage: `url("${imgGroup2}")`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "-47px 25px", maskPosition: "-47px 25px", WebkitMaskSize: "639px 292px", maskSize: "639px 292px" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} fill="none" preserveAspectRatio="none" viewBox="0 0 620 535.33">
            <path d={svgP1} fill="#001E62" />
            <path d={svgP2} fill="#001E62" />
          </svg>
        </div>
        {/* "Unidos por Venezuela" text overlay on map */}
        <div style={{ position: "absolute", left: 688, top: 1300, width: 592, height: 292, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontFamily: hv, fontSize: 28, color: "white", lineHeight: "36px" }}>Unidos por</span>
          <span style={{ fontFamily: hv, fontWeight: "bold", fontSize: 38, color: "#f5c842", lineHeight: "44px" }}>Venezuela</span>
        </div>
        <div style={{ position: "absolute", left: 867, top: 1410, width: 284, height: 77, WebkitMaskImage: `url("${imgGroup2}")`, maskImage: `url("${imgGroup2}")`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "-226px -110px", maskPosition: "-226px -110px", WebkitMaskSize: "639px 292px", maskSize: "639px 292px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
        </div>
        <div style={{ position: "absolute", left: 138, top: 1456, transform: "translateY(-50%)", fontFamily: hv, fontWeight: "bold", fontSize: 32, color: "#001e62", lineHeight: "40px", width: 544 }}>
          Hoy, más que nunca, tu solidaridad puede hacer la diferencia.
        </div>
        <div style={{ position: "absolute", left: 138, top: 1512, transform: "translateY(-50%)", fontFamily: hv, fontSize: 24, color: "#001e62", lineHeight: "32px", whiteSpace: "nowrap" }}>
          Gracias por tu apoyo a Venezuela.
        </div>
        <div style={{ position: "absolute", left: 0, top: 1592, width: 1280, height: 77, background: "#001e62" }} />
      </div>
    </div>
  );
}

function DesktopLayoutCO() {
  return (
    <div style={{ width: "100%", background: "#f4f4f5", overflowX: "hidden" }}>
      {/* Header band — limitado a 1280px centrado igual que VE */}
      <div style={{ width: 1280, margin: "0 auto", background: "#d9e8f8", padding: "32px 68px 100px", textAlign: "center" }}>
        <p style={{ fontFamily: hv, fontSize: 16, color: "#001e62", lineHeight: "24px", margin: "0 0 6px" }}>
          Elige la ONG a la que deseas apoyar y selecciona el método de pago de tu preferencia.
        </p>
        <p style={{ fontFamily: hv, fontWeight: "bold", fontSize: 24, color: "#001e62", lineHeight: "32px", margin: 0 }}>
          Cada aporte, sin importar el monto, ayuda a quienes más lo necesitan.
        </p>
      </div>

      {/* HowTo — marginTop negativo para que solape el blue band como en VE */}
      <div style={{ width: 1280, margin: "0 auto", padding: "0 68px", marginTop: -54 }}>
        <div style={{ position: "relative", background: "#ecf3fb", border: "1px solid #418fde", borderRadius: 20, overflow: "hidden", height: 197, display: "flex" }}>
          <div style={{ width: 338, flexShrink: 0, position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src={imgRectangle16} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.55 }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 162, height: "100%", backgroundImage: "linear-gradient(to right, rgba(236,243,251,0), rgb(236,243,251))" }} />
          </div>
          <div style={{ padding: "22px 24px" }}>
            <p style={{ fontFamily: hv, fontWeight: "bold", fontSize: 20, color: "#001e62", lineHeight: "24px", margin: "0 0 12px" }}>¿Cómo donar?</p>
            <ol style={{ fontFamily: hv, fontSize: 16, color: "#272d3b", lineHeight: "24px", margin: 0, paddingLeft: 24 }}>
              <li>Elije un país y una ONG a la que donar.</li>
              <li>Selecciona el método de pago.</li>
              <li>Toca cualquier campo para copiarlo.</li>
              <li>Realiza el pago desde tu app bancaria.</li>
              <li>¡Listo! No necesitas enviarnos comprobante.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Cards — flujo normal para que crezcan sin desbordarse */}
      <div style={{ width: 1280, margin: "0 auto", padding: "32px 68px 60px", display: "flex", gap: 64, alignItems: "flex-start" }}>
        <div style={{ flex: 1, background: "white", borderRadius: 20, boxShadow: "0px 4px 22.1px 0px rgba(0,0,0,0.18)" }}>
          <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", height: 174 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgCaritasCol} alt="Cáritas Colombiana" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ padding: "25px 16px 24px" }}><CaritasColContent /></div>
        </div>
        <div style={{ flex: 1, background: "white", borderRadius: 20, boxShadow: "0px 4px 22.1px 0px rgba(0,0,0,0.18)" }}>
          <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", height: 174 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgDividendo} alt="Dividendo Voluntario" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ padding: "25px 16px 24px" }}><DividendoColContent /></div>
        </div>
      </div>

      {/* Footer */ }
      <div style={{ position: "relative", background: "linear-gradient(182.21deg, rgb(65,143,222) 20.29%, rgb(141,187,235) 153.32%)", padding: "52px 68px 52px 206px", minHeight: 292, boxSizing: "border-box" }}>
        <p style={{ fontFamily: hv, fontWeight: "bold", fontSize: 32, color: "#001e62", lineHeight: "40px", margin: "0 0 16px", maxWidth: 544 }}>
          Hoy, más que nunca, tu solidaridad puede hacer la diferencia.
        </p>
        <p style={{ fontFamily: hv, fontSize: 24, color: "#001e62", lineHeight: "32px", margin: 0 }}>
          Gracias por tu apoyo a Venezuela.
        </p>
        {/* Venezuela map — right side */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 592, height: 292, WebkitMaskImage: `url("${imgGroup2}")`, maskImage: `url("${imgGroup2}")`, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "-47px 25px", maskPosition: "-47px 25px", WebkitMaskSize: "639px 292px", maskSize: "639px 292px" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} fill="none" preserveAspectRatio="none" viewBox="0 0 620 535.33">
            <path d={svgP1} fill="#001E62" />
            <path d={svgP2} fill="#001E62" />
          </svg>
        </div>
        {/* "Unidos por Venezuela" text overlay on map */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 592, height: 292, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontFamily: hv, fontSize: 28, color: "white", lineHeight: "36px" }}>Unidos por</span>
          <span style={{ fontFamily: hv, fontWeight: "bold", fontSize: 38, color: "#f5c842", lineHeight: "44px" }}>Venezuela</span>
        </div>
      </div>
      <div style={{ height: 77, background: "#001e62" }} />
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────────── */

const CSS = `
  /* ─── Mobile first (default) ─────────────────────────── */
  .d-fluid   { display: block; }
  .d-desktop { display: none; }

  .d-band         { padding: 18px 16px; }
  .d-band-sub     { font-size: 13px; }
  .d-band-main    { font-size: 15px; }

  .d-howto-gap    { height: 16px; }
  .d-howto-wrap   { padding: 0 16px; }
  .d-show-mobile  { display: block; }
  .d-show-tablet  { display: none; }

  .d-cards        { display: flex; flex-direction: column; gap: 18px; padding: 20px 16px; align-items: flex-start; }
  .d-card-item    { width: 100%; min-width: 0; }
  .d-card-header  { height: 148px; }
  .d-card-body    { padding: 18px 14px 22px; }
  .d-footer       { display: none; }

  .d-tabs         { height: 50px; }
  /* Mobile: equal-width tabs fill the full-width card */
  .d-tab          { height: 42px; padding: 0 4px; font-size: 10px; flex: 1 1 0; }

  .d-label        { font-size: 11px; }
  .d-field        { height: 42px; }
  .d-field-text   { font-size: 14px; }
  .d-field-text-half { font-size: 13px; }
  .d-ml-text      { font-size: 13px; }
  .d-mercantil    { height: 28px; width: 80px; }
  .d-jpmorgan     { height: 28px; width: 86px; }
  .d-paypal-logo  { height: 44px; width: 160px; }
  .d-breb-logo    { height: 44px; width: 140px; }

  /* ─── Tablet 640px+ ───────────────────────────────────── */
  @media (min-width: 640px) {
    .d-band         { padding: 28px 24px; }
    .d-band-sub     { font-size: 15px; }
    .d-band-main    { font-size: 18px; }

    .d-howto-gap    { height: 20px; }
    .d-howto-wrap   { padding: 0 24px; }
    .d-show-mobile  { display: none; }
    .d-show-tablet  { display: block; }

    .d-cards        { flex-direction: row; gap: 20px; padding: 24px 24px; }
    .d-card-item    { flex: 1 1 0; width: auto; }
    .d-card-header  { height: 168px; }
    .d-card-body    { padding: 22px 18px 22px; }
    .d-footer       { display: block; }

    .d-tabs         { height: 59px; }
    /* Tablet: natural width per tab, container scrolls horizontally (swipeable) */
    .d-tab          { height: 49px; padding: 0 10px; font-size: 13px; flex: 0 0 auto; }

    .d-label        { font-size: 14px; }
    .d-field        { height: 48px; }
    .d-field-text   { font-size: 16px; }
    .d-field-text-half { font-size: 14px; }
    .d-ml-text      { font-size: 16px; }
    .d-mercantil    { height: 38px; width: 109px; }
    .d-jpmorgan     { height: 40px; width: 120px; }
    .d-paypal-logo  { height: 58px; width: 206px; }
    .d-breb-logo    { height: 63px; width: 183px; }
  }

  /* ─── Wide tablet 900px+ ──────────────────────────────── */
  @media (min-width: 900px) {
    .d-band       { padding: 28px 40px; }
    .d-howto-wrap { padding: 0 40px; }
    .d-cards      { padding: 24px 40px; }
  }

  /* ─── Desktop 1280px+ ────────────────────────────────── */
  @media (min-width: 1280px) {
    .d-fluid   { display: none; }
    .d-desktop { display: block; }
    /* Desktop cards are 492px wide — restore equal-width tabs at 15px, they fit */
    .d-tab     { padding: 0 14px; font-size: 15px; flex: 1 1 0; }
  }
`;

export default function DonarDineroPage({ pais = "VE" }: { pais?: string }) {
  return (
    <>
      <style>{CSS}</style>
      {/* marginTop + paddingTop: extends background into the pt-12 nav gap */}
      <div style={{ marginTop: "-48px", paddingTop: "48px", overflowX: "hidden" }}>
        <div className="d-fluid"><FluidLayout pais={pais} /></div>
        <div className="d-desktop"><DesktopLayout pais={pais} /></div>
      </div>
    </>
  );
  
}