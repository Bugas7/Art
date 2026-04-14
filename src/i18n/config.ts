export const locales = ['en', 'de', 'uk', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const labels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  uk: 'Українська',
  ru: 'Русский',
};
