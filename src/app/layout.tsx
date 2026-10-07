import type { Metadata } from "next";
import { PracticeStoreHydrator } from "@/components/providers/PracticeStoreHydrator";
import { SiteNavigation } from "@/components/layout/SiteNavigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diario de práctica",
  description: "Registro de práctica musical sin distracciones.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <PracticeStoreHydrator />
        <SiteNavigation />
        {children}
      </body>
    </html>
  );
}
