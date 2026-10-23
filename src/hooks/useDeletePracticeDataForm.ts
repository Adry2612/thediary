"use client";

import { useCallback, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { errorMessage } from "@/utils/error-message";
import { isDeleteConfirmation } from "@/utils/account-validation";
import type { DeletePracticeDataMessages } from "@/types/settings";

export function useDeletePracticeDataForm(
  messages: DeletePracticeDataMessages,
) {
  const { deleteAllPracticeData } = useAppData();
  const [confirmation, setConfirmation] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const canDelete = isDeleteConfirmation(
    confirmation,
    messages.confirmationWord,
  );

  const submit = useCallback(async () => {
    if (!canDelete) return;

    setIsWorking(true);
    setError(null);
    try {
      await deleteAllPracticeData();
      setIsComplete(true);
    } catch (deleteError) {
      setError(errorMessage(deleteError, messages.deleteFailed));
    } finally {
      setIsWorking(false);
    }
  }, [canDelete, deleteAllPracticeData, messages.deleteFailed]);

  return {
    confirmation,
    setConfirmation,
    isWorking,
    error,
    isComplete,
    canDelete,
    submit,
  };
}
