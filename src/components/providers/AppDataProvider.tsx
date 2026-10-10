"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_PRACTICE_GOALS } from "@/lib/practice-goals";
import {
  deleteAllCloudPracticeFiles,
  importLocalPracticeFiles,
} from "@/lib/supabase/practice-files";
import {
  clearLocalPracticeLibrary,
  listPracticeAssets,
  listPracticeRecordings,
} from "@/lib/practice-library";
import {
  createEmptyPracticeData,
  deleteCloudPracticeData,
  loadCloudPracticeData,
  mergePracticeData,
  normalizePracticeData,
  saveCloudPracticeData,
} from "@/lib/supabase/practice-data";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  clearPracticeStorageNamespace,
  readPracticeStorageNamespace,
  setPracticeStorageNamespace,
  type PersistedPracticeState,
} from "@/stores/practiceStorage";
import {
  getPersistedPracticeState,
  replacePracticeState,
  usePracticeStore,
} from "@/stores/usePracticeStore";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ImportedDataCounts {
  sessions: number;
  templates: number;
  repertoireItems: number;
  recordings: number;
  assets: number;
}

const PENDING_NEW_ACCOUNT_KEY = "guitar-practice-pending-new-account";

interface AppDataContextValue {
  client: SupabaseClient | null;
  user: User | null;
  isReady: boolean;
  isConfigured: boolean;
  configurationError: string | null;
  dataError: string | null;
  clearDataError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAllPracticeData: () => Promise<void>;
  retryCloudSync: () => Promise<void>;
  showLocalImportOffer: boolean;
  dismissLocalImportOffer: () => void;
  importLocalData: () => Promise<ImportedDataCounts>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function hasPracticeData(state: PersistedPracticeState): boolean {
  return (
    state.history.length > 0 ||
    state.templates.length > 0 ||
    state.repertoireItems.length > 0 ||
    Object.values(state.weeklySchedule).some((routineId) => routineId !== null) ||
    state.practiceGoals.dailyMinutes !== DEFAULT_PRACTICE_GOALS.dailyMinutes ||
    state.practiceGoals.weeklyDays !== DEFAULT_PRACTICE_GOALS.weeklyDays
  );
}

async function hasGuestLocalData(): Promise<boolean> {
  const guestState = normalizePracticeData(
    readPracticeStorageNamespace("guest"),
  );
  if (hasPracticeData(guestState)) return true;

  const [assets, recordings] = await Promise.all([
    listPracticeAssets(),
    listPracticeRecordings(),
  ]);
  return assets.length > 0 || recordings.length > 0;
}

function hasPracticeStateChanged(
  current: PersistedPracticeState,
  previous: PersistedPracticeState,
): boolean {
  return (
    current.history !== previous.history ||
    current.templates !== previous.templates ||
    current.repertoireItems !== previous.repertoireItems ||
    current.weeklySchedule !== previous.weeklySchedule ||
    current.practiceGoals !== previous.practiceGoals
  );
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [configurationError, setConfigurationError] = useState<string | null>(
    null,
  );
  const [isConfigured, setIsConfigured] = useState(false);
  const [clientResolved, setClientResolved] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [newAccountUserId, setNewAccountUserId] = useState<string | null>(null);
  const [showLocalImportOffer, setShowLocalImportOffer] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [syncReady, setSyncReady] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const currentUserId = useRef<string | null>(null);
  const applyingRemoteState = useRef(false);
  const cloudSaveQueue = useRef(Promise.resolve());
  const pendingCloudSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const supabase = getSupabaseClient();
      setClient(supabase);
      setIsConfigured(supabase !== null);
    } catch (error) {
      setConfigurationError(errorMessage(error, "La configuración no es válida."));
    } finally {
      setClientResolved(true);
    }
  }, []);

  useEffect(() => {
    if (!clientResolved) return;
    if (!client) {
      setAuthResolved(true);
      return;
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (
        nextUser &&
        window.localStorage.getItem(PENDING_NEW_ACCOUNT_KEY) === nextUser.id
      ) {
        setNewAccountUserId(nextUser.id);
      }
      if (currentUserId.current !== (nextUser?.id ?? null)) {
        currentUserId.current = nextUser?.id ?? null;
        setIsReady(false);
        setSyncReady(false);
      }
      setUser(nextUser);
      setAuthResolved(true);
    });
    return () => subscription.unsubscribe();
  }, [client, clientResolved]);

  useEffect(() => {
    if (!authResolved) return;
    let isMounted = true;
    const userId = user?.id ?? null;
    setSyncReady(false);
    setDataError(null);

    async function hydrate() {
      try {
        setPracticeStorageNamespace(userId ? `user-${userId}` : "guest");
        await usePracticeStore.persist.rehydrate();
        if (!isMounted) return;

        if (userId && client) {
          const cloudState = await loadCloudPracticeData(userId);
          if (!isMounted) return;
          if (cloudState) {
            replacePracticeState(cloudState);
          } else {
            const cachedState = getPersistedPracticeState();
            if (hasPracticeData(cachedState)) {
              await saveCloudPracticeData(userId, cachedState);
            }
          }
          if (isMounted) setSyncReady(true);
        }
      } catch (error) {
        if (isMounted) {
          setDataError(
            errorMessage(error, "No se pudieron sincronizar los datos."),
          );
        }
      } finally {
        if (isMounted) setIsReady(true);
      }
    }

    void hydrate();
    return () => {
      isMounted = false;
    };
  }, [authResolved, client, user?.id]);

  useEffect(() => {
    const userId = user?.id;
    if (!isReady || !userId || newAccountUserId !== userId) {
      setShowLocalImportOffer(false);
      return;
    }

    let isMounted = true;
    void hasGuestLocalData()
      .then((hasLocalData) => {
        if (!isMounted) return;
        setShowLocalImportOffer(hasLocalData);
        if (!hasLocalData) {
          window.localStorage.removeItem(PENDING_NEW_ACCOUNT_KEY);
          setNewAccountUserId(null);
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setDataError(
            errorMessage(error, "No se pudieron comprobar los datos locales."),
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isReady, newAccountUserId, user?.id]);

  useEffect(() => {
    const userId = user?.id;
    if (!client || !userId || !isReady || !syncReady) return;

    const unsubscribe = usePracticeStore.subscribe((state, previousState) => {
      if (applyingRemoteState.current) return;
      const currentData: PersistedPracticeState = {
        history: state.history,
        templates: state.templates,
        repertoireItems: state.repertoireItems,
        weeklySchedule: state.weeklySchedule,
        practiceGoals: state.practiceGoals,
      };
      const previousData: PersistedPracticeState = {
        history: previousState.history,
        templates: previousState.templates,
        repertoireItems: previousState.repertoireItems,
        weeklySchedule: previousState.weeklySchedule,
        practiceGoals: previousState.practiceGoals,
      };
      if (!hasPracticeStateChanged(currentData, previousData)) return;

      if (pendingCloudSave.current) clearTimeout(pendingCloudSave.current);
      pendingCloudSave.current = setTimeout(() => {
        pendingCloudSave.current = null;
        const snapshot = getPersistedPracticeState();
        cloudSaveQueue.current = cloudSaveQueue.current
          .catch(() => undefined)
          .then(() => saveCloudPracticeData(userId, snapshot))
          .then(() => setDataError(null))
          .catch((error: unknown) => {
            setDataError(
              errorMessage(error, "No se pudieron sincronizar tus cambios."),
            );
          });
      }, 600);
    });

    const channel = client
      .channel(`practice-data-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "practice_data",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (currentUserId.current !== userId) return;
          if (pendingCloudSave.current) return;
          const row = payload.new as {
            state?: unknown;
          };
          if (!row.state) return;

          const remoteState = normalizePracticeData(row.state);
          const currentState = getPersistedPracticeState();
          if (JSON.stringify(remoteState) === JSON.stringify(currentState)) {
            return;
          }

          applyingRemoteState.current = true;
          replacePracticeState(remoteState);
          queueMicrotask(() => {
            applyingRemoteState.current = false;
          });
        },
      )
      .subscribe();

    return () => {
      if (pendingCloudSave.current) {
        clearTimeout(pendingCloudSave.current);
        pendingCloudSave.current = null;
      }
      unsubscribe();
      void client.removeChannel(channel);
    };
  }, [client, isReady, syncReady, user?.id]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!client) {
        throw new Error("Configura Supabase para iniciar sesión.");
      }
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(error.message);
    },
    [client],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!client) {
        throw new Error("Configura Supabase para crear una cuenta.");
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });
      if (error) throw new Error(error.message);
      if (
        data.user &&
        ((data.user.identities?.length ?? 0) > 0 || data.session !== null)
      ) {
        window.localStorage.setItem(PENDING_NEW_ACCOUNT_KEY, data.user.id);
        setNewAccountUserId(data.user.id);
      }
      return data.session !== null;
    },
    [client],
  );

  const signOut = useCallback(async () => {
    if (!client) throw new Error("Supabase no está configurado.");
    if (!user || !syncReady) {
      throw new Error("Espera a que termine la sincronización antes de cerrar sesión.");
    }
    await cloudSaveQueue.current.catch(() => undefined);
    await saveCloudPracticeData(user.id, getPersistedPracticeState());
    const { error } = await client.auth.signOut();
    if (error) throw new Error(error.message);
  }, [client, syncReady, user]);

  const updatePassword = useCallback(
    async (password: string) => {
      if (!client || !user) {
        throw new Error("Inicia sesión para cambiar tu contraseña.");
      }
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    [client, user],
  );

  const deleteAllPracticeData = useCallback(async () => {
    if (!client || !user || !syncReady) {
      throw new Error("Espera a que termine la sincronización antes de borrar tus datos.");
    }

    setSyncReady(false);
    setDataError(null);
    if (pendingCloudSave.current) {
      clearTimeout(pendingCloudSave.current);
      pendingCloudSave.current = null;
    }

    try {
      await cloudSaveQueue.current.catch(() => undefined);
      await deleteAllCloudPracticeFiles(user.id);
      await deleteCloudPracticeData(user.id);
      replacePracticeState(createEmptyPracticeData());
      clearPracticeStorageNamespace(`user-${user.id}`);
      clearPracticeStorageNamespace("guest");
      window.localStorage.removeItem(PENDING_NEW_ACCOUNT_KEY);
      await clearLocalPracticeLibrary();
      setShowLocalImportOffer(false);
      setNewAccountUserId(null);
    } finally {
      setSyncReady(true);
    }
  }, [client, syncReady, user]);

  const retryCloudSync = useCallback(async () => {
    if (!client || !user) {
      throw new Error("Inicia sesión para sincronizar tus datos.");
    }

    setSyncReady(false);
    setDataError(null);
    try {
      const cloudState = await loadCloudPracticeData(user.id);
      const localState = getPersistedPracticeState();
      const nextState = cloudState
        ? mergePracticeData(cloudState, localState)
        : localState;
      await saveCloudPracticeData(user.id, nextState);
      replacePracticeState(nextState);
      setSyncReady(true);
    } catch (error) {
      setDataError(
        errorMessage(error, "No se pudieron sincronizar tus datos."),
      );
      throw error;
    }
  }, [client, user]);

  const importLocalData = useCallback(async () => {
    if (!client || !user) {
      throw new Error("Inicia sesión para importar tus datos locales.");
    }
    if (!isReady || !syncReady || !showLocalImportOffer) {
      throw new Error("Espera a que termine la carga de tus datos.");
    }
    if (dataError) {
      throw new Error(
        "No se ha podido cargar la cuenta. Recarga la página y vuelve a intentarlo antes de importar.",
      );
    }

    const rawGuestState = readPracticeStorageNamespace("guest");
    const guestState: PersistedPracticeState = {
      history: Array.isArray(rawGuestState?.history)
        ? rawGuestState.history
        : [],
      templates: Array.isArray(rawGuestState?.templates)
        ? rawGuestState.templates
        : [],
      repertoireItems: Array.isArray(rawGuestState?.repertoireItems)
        ? rawGuestState.repertoireItems
        : [],
      weeklySchedule:
        rawGuestState?.weeklySchedule ??
        getPersistedPracticeState().weeklySchedule,
      practiceGoals:
        rawGuestState?.practiceGoals ??
        getPersistedPracticeState().practiceGoals,
    };
    const currentState = getPersistedPracticeState();
    const mergedState = mergePracticeData(currentState, guestState);
    const importedFiles = await importLocalPracticeFiles(user.id);

    await saveCloudPracticeData(user.id, mergedState);
    replacePracticeState(mergedState);
    setDataError(null);
    setShowLocalImportOffer(false);
    setNewAccountUserId(null);
    window.localStorage.removeItem(PENDING_NEW_ACCOUNT_KEY);
    return {
      sessions: guestState.history.length,
      templates: guestState.templates.length,
      repertoireItems: guestState.repertoireItems.length,
      recordings: importedFiles.recordings,
      assets: importedFiles.assets,
    };
  }, [client, dataError, isReady, showLocalImportOffer, syncReady, user]);

  const dismissLocalImportOffer = useCallback(() => {
    setShowLocalImportOffer(false);
    setNewAccountUserId(null);
    window.localStorage.removeItem(PENDING_NEW_ACCOUNT_KEY);
  }, []);

  const contextValue = useMemo(
    () => ({
      client,
      user,
      isReady,
      isConfigured,
      configurationError,
      dataError,
      clearDataError: () => setDataError(null),
      signIn,
      signUp,
      signOut,
      updatePassword,
      deleteAllPracticeData,
      retryCloudSync,
      showLocalImportOffer,
      dismissLocalImportOffer,
      importLocalData,
    }),
    [
      client,
      user,
      isReady,
      isConfigured,
      configurationError,
      dataError,
      signIn,
      signUp,
      signOut,
      updatePassword,
      deleteAllPracticeData,
      retryCloudSync,
      showLocalImportOffer,
      dismissLocalImportOffer,
      importLocalData,
    ],
  );

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData debe utilizarse dentro de AppDataProvider.");
  }
  return context;
}
