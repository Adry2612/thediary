"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/providers/AppDataProvider";
import { errorMessage } from "@/utils/error-message";
import type { SignOutState } from "@/types/settings";

/**
 * Cerrar sesión desde los ajustes: espera a que el proveedor guarde lo que
 * quede pendiente y vuelve a la pantalla de cuenta.
 */
export function useSignOut(errorFallback: string): SignOutState {
  const router = useRouter();
  const { signOut } = useAppData();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setIsWorking(true);
    setError(null);
    try {
      await signOut();
      router.replace("/account");
    } catch (signOutError) {
      setError(errorMessage(signOutError, errorFallback));
    } finally {
      setIsWorking(false);
    }
  }, [errorFallback, router, signOut]);

  return { isWorking, error, submit };
}
