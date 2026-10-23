"use client";

import { useCallback, useState, type FormEvent } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { errorMessage } from "@/utils/error-message";
import { passwordsMatch } from "@/utils/account-validation";
import type { ChangePasswordMessages } from "@/types/settings";

export function useChangePasswordForm(messages: ChangePasswordMessages) {
  const { updatePassword } = useAppData();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!passwordsMatch(password, confirmation)) {
        setError(messages.mismatch);
        return;
      }

      setIsWorking(true);
      setError(null);
      try {
        await updatePassword(password);
        setIsComplete(true);
      } catch (updateError) {
        setError(errorMessage(updateError, messages.updateFailed));
      } finally {
        setIsWorking(false);
      }
    },
    [confirmation, messages.mismatch, messages.updateFailed, password, updatePassword],
  );

  return {
    password,
    confirmation,
    setPassword,
    setConfirmation,
    isWorking,
    error,
    isComplete,
    submit,
  };
}
