"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Práctica" },
  { href: "/repertoire", label: "Mi repertorio" },
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8"
      >
        <Link
          href="/"
          className="shrink-0 font-serif text-xl tracking-[-0.02em] text-ink"
        >
          Diario de práctica
        </Link>
        <ul className="flex max-w-full items-center gap-1 overflow-x-auto">
          {NAVIGATION.map((item) => {
            const isCurrent =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 text-xs transition sm:text-sm ${isCurrent ? "bg-white/5 text-ink" : "text-muted hover:text-ink"}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
