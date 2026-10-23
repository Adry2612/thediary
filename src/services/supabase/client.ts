"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function createSafeAuthStorage(): Storage {
  const memory = new Map<string, string>();
  const canUseBrowserStorage = () => {
    try {
      const key = "thediary-storage-test";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  return {
    get length() {
      return memory.size;
    },
    clear() {
      try {
        window.localStorage.clear();
      } catch {
        memory.clear();
      }
    },
    getItem(key) {
      try {
        if (canUseBrowserStorage()) return window.localStorage.getItem(key);
      } catch {
        // Fall through to the in-memory session.
      }
      return memory.get(key) ?? null;
    },
    key(index) {
      try {
        if (canUseBrowserStorage()) return window.localStorage.key(index);
      } catch {
        // Fall through to the in-memory session.
      }
      return Array.from(memory.keys())[index] ?? null;
    },
    removeItem(key) {
      try {
        if (canUseBrowserStorage()) window.localStorage.removeItem(key);
      } catch {
        // Fall through to the in-memory session.
      }
      memory.delete(key);
    },
    setItem(key, value) {
      try {
        if (canUseBrowserStorage()) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch {
        // Fall through to the in-memory session.
      }
      memory.set(key, value);
    },
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url && !key) return null;
  if (!url || !key) {
    throw new Error(
      "Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  let projectUrl: URL;
  try {
    projectUrl = new URL(url);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe ser la URL base del proyecto, por ejemplo https://<project-ref>.supabase.co.",
    );
  }

  if (
    (projectUrl.protocol !== "https:" && projectUrl.protocol !== "http:") ||
    projectUrl.pathname !== "/" ||
    projectUrl.search ||
    projectUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe contener solo el origen del proyecto. Quita rutas como /rest/v1.",
    );
  }

  supabaseClient ??= createClient(projectUrl.origin, key, {
    auth: {
      storage: createSafeAuthStorage(),
    },
  });
  return supabaseClient;
}
