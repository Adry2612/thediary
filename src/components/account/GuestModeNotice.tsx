"use client";

import Link from "next/link";
import { useAppData } from "@/components/providers/AppDataProvider";

export function GuestModeNotice() {
  const { user, isReady, dataError } = useAppData();
  if (!isReady) return null;

  if (user) {
    return dataError ? (
      <div className="border-b border-red-400/30 bg-red-400/5 px-5 py-2 text-center text-xs text-red-200 sm:px-8">
        Los cambios recientes no se han sincronizado: {dataError}{" "}
        <Link href="/account" className="underline underline-offset-2">
          Ver cuenta
        </Link>
      </div>
    ) : null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-300/20 bg-amber-300/[0.04] px-5 py-2 text-center text-xs text-amber-100/80 sm:px-8"
    >
      Modo local: tus datos solo están en este navegador y podrían perderse si
      borras sus datos o cambias de dispositivo.{" "}
      <Link href="/account" className="underline underline-offset-2">
        Crear cuenta o iniciar sesión
      </Link>
    </div>
  );
}
