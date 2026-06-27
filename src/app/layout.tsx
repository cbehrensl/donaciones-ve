import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donaciones Venezuela",
  description:
    "Información en vivo sobre centros de acopio y necesidades de insumos tras la emergencia.",
  robots: "index, follow",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased" style={{ background: "#EBF3FB", color: "#002858" }}>
        {/* Top brand bar */}
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1 w-full"
          style={{ background: "#0084D0" }}
          aria-hidden="true"
        />
        <NavBar />
        <div className="page-scroll pt-12">{children}</div>
      </body>
    </html>
  );
}
