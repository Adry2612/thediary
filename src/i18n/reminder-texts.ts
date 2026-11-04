import { getDictionary, type Locale } from "./translations.ts";
import type { ReminderTextTemplates } from "../types/reminders.ts";

/** Textos del aviso localizados al generar el plan. */
export function getReminderTexts(locale: Locale): ReminderTextTemplates {
  const reminders = getDictionary(locale).reminders;
  return {
    title: reminders.notificationTitle,
    practice: reminders.notificationPractice,
    strings: reminders.notificationStrings,
    inactivity: reminders.notificationInactivity,
  };
}
