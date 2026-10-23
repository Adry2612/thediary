"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/providers/AppDataProvider";
import { errorMessage } from "@/utils/error-message";
import { interpolate } from "@/utils/interpolate";
import type { AccountMessages } from "@/types/account";

export function useAccountView(messages: AccountMessages) {
  const {
    user,
    isReady,
    isConfigured,
    configurationError,
    dataError,
    signIn,
    signUp,
    retryCloudSync,
    showLocalImportOffer,
    dismissLocalImportOffer,
    importLocalData,
  } = useAppData();
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectMode = useCallback((createAccount: boolean) => {
    setIsCreatingAccount(createAccount);
    setError(null);
    setMessage(null);
  }, []);

  const submitCredentials = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsWorking(true);
      setError(null);
      setMessage(null);

      try {
        if (isCreatingAccount) {
          const hasSession = await signUp(email.trim(), password);
          setMessage(
            hasSession ?
              messages.accountCreated
            : messages.accountCreatedConfirm,
          );
        } else {
          await signIn(email.trim(), password);
          router.replace("/");
        }
      } catch (authError) {
        setError(errorMessage(authError, messages.authFailed));
      } finally {
        setIsWorking(false);
      }
    },
    [
      email,
      isCreatingAccount,
      messages.accountCreated,
      messages.accountCreatedConfirm,
      messages.authFailed,
      password,
      router,
      signIn,
      signUp,
    ],
  );

  const importLocal = useCallback(async () => {
    if (!window.confirm(messages.importConfirm)) return;

    setIsWorking(true);
    setError(null);
    setMessage(null);
    try {
      const counts = await importLocalData();
      setMessage(interpolate(messages.importComplete, counts));
    } catch (importError) {
      setError(errorMessage(importError, messages.importFailed));
    } finally {
      setIsWorking(false);
    }
  }, [
    importLocalData,
    messages.importComplete,
    messages.importConfirm,
    messages.importFailed,
  ]);

  const retrySync = useCallback(async () => {
    setIsWorking(true);
    setError(null);
    try {
      await retryCloudSync();
      setMessage(messages.syncSuccess);
    } catch (syncError) {
      setError(errorMessage(syncError, messages.syncFailed));
    } finally {
      setIsWorking(false);
    }
  }, [messages.syncFailed, messages.syncSuccess, retryCloudSync]);

  return {
    user,
    isReady,
    isConfigured,
    configurationError,
    dataError,
    showLocalImportOffer,
    dismissLocalImportOffer,
    isCreatingAccount,
    email,
    password,
    isWorking,
    error,
    message,
    setEmail,
    setPassword,
    selectMode,
    submitCredentials,
    importLocal,
    retrySync,
  };
}
