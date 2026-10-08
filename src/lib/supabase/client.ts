"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

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

  supabaseClient ??= createClient(projectUrl.origin, key);
  return supabaseClient;
}
