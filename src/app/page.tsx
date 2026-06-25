import { getCentrosAcopio, getEstados, getMunicipios } from "@/lib/data";
import { HomeClient } from "./HomeClient";

export const revalidate = 15;

export default async function HomePage() {
  const [estados, municipios, centros] = await Promise.all([
    getEstados(),
    getMunicipios(),
    getCentrosAcopio(),
  ]);

  return <HomeClient estados={estados} municipios={municipios} centros={centros} />;
}
