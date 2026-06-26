"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Donar dinero" },
    { href: "/centros", label: "Centros de acopio" },
  ];

  return (
    <nav
      className="fixed top-1 left-0 right-0 z-40 flex justify-center gap-2 border-b px-4 py-2.5"
      style={{ background: "#002858", borderColor: "#001e42" }}
    >
      {links.map(({ href, label }) => {
        const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="px-5 py-1.5 text-sm font-bold rounded-full border transition-colors"
            style={{
              background: isActive ? "#0084D0" : "transparent",
              borderColor: "#0084D0",
              color: "#fff",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
