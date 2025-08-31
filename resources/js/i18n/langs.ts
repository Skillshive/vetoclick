export type LocaleCode = 'en' | 'ar' | 'fr';
export type Dir = 'ltr' | 'rtl';

export interface Locale {
  code: LocaleCode;
  name: string;
  native: string;
  dir: Dir;
  flag: string;
}

export const locales: Record<LocaleCode, Locale> = {
  en: {
    code: 'en',
    name: 'English',
    native: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    native: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
  },
  fr: {
    code: 'fr',
    name: 'French',
    native: 'Français',
    dir: 'ltr',
    flag: '🇫🇷',
  },
};

export const defaultLocale: LocaleCode = 'en';