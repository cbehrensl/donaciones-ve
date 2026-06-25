import { getHomeData } from "@/lib/data";
import { HomeClient } from "./HomeClient";

export const revalidate = 15;

export default async function HomePage() {
  const { estados, municipios, centros, contactosEmergencia, errors } =
    await getHomeData();

  return (
    <HomeClient
      estados={estados}
      municipios={municipios}
      centros={centros}
      contactosEmergencia={contactosEmergencia}
      errors={errors}
    />
  );
}
