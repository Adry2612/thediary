"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createTranslator } from "@/i18n/createTranslator";
import { defaultLocale, isLocale, translations, type Locale } from "@/i18n/translations";
import type { Dict } from "@/i18n/dictionary";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
};

const storageKey = "thediary.locale";
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(storageKey);
    if (storedLocale && isLocale(storedLocale)) {
      setLocaleState(storedLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(storageKey, nextLocale);
  };

  const value = useMemo(
    () => ({ locale, setLocale, t: createTranslator(translations[locale]) }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}

export function useI18nSection<K extends keyof Dict>(section: K): Dict[K] {
  const { locale } = useI18n();
  return translations[locale][section];
}
