import DonarDineroPage from "./DonarDineroPage";

export default function DonarPage() {
  const pais = (process.env.FILTRO_PAIS ?? "VE") as "VE" | "CO";
  return <DonarDineroPage pais={pais} />;
}
