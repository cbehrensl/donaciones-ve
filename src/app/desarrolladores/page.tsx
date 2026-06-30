import type { Metadata } from "next";
import { DevDocsClient } from "./DevDocsClient";

export const metadata: Metadata = {
  title: "API para Desarrolladores — Apoyo Venezuela",
  description:
    "API pública y gratuita con datos en tiempo real de centros de acopio, refugios y links de donación verificados.",
};

export default function DesarrolladoresPage() {
  return <DevDocsClient />;
}
