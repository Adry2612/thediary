"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/providers/AppDataProvider";
import {
  getCurrentPushEndpoint,
  unsubscribeFromPush,
} from "@/services/push-reminders";
import { deletePushSubscription } from "@/services/supabase/push-subscriptions";
import { errorMessage } from "@/utils/error-message";
import type { SignOutState } from "@/types/settings";

/**
 * Cerrar sesión desde los ajustes: espera a que el proveedor guarde lo que
 * quede pendiente y vuelve a la pantalla de cuenta.
 */
export function useSignOut(errorFallback: string): SignOutState {
  const router = useRouter();
  const { signOut, user } = useAppData();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async () => {
    setIsWorking(true);
    setError(null);
    try {
      // Quita la suscripción de este dispositivo antes de perder la sesión.
      if (user) {
        const endpoint = await getCurrentPushEndpoint();
        if (endpoint) await deletePushSubscription(user.id, endpoint);
      }
      await unsubscribeFromPush();
      await signOut();
      router.replace("/account");
    } catch (signOutError) {
      setError(errorMessage(signOutError, errorFallback));
    } finally {
      setIsWorking(false);
    }
  }, [errorFallback, router, signOut, user]);

  return { isWorking, error, submit };
}
