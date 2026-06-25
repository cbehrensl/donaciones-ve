import type { Metadata } from "next";
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
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <div
          className="fixed top-0 left-0 right-0 z-50 h-1 w-full bg-gradient-to-r from-[#F7D117] via-[#0033A0] to-[#CE1126]"
          aria-hidden="true"
        />
        {children}
      </body>
    </html>
  );
}
