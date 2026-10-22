import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Cuántos elementos se han importado de los datos locales de este navegador. */
export interface ImportedDataCounts {
  sessions: number;
  templates: number;
  repertoireItems: number;
  recordings: number;
  assets: number;
}

/** Lo que el proveedor de datos ofrece a la aplicación. */
export interface AppDataContextValue {
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
