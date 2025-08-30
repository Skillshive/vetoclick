import { usePage } from '@inertiajs/react';

function getInertiaProps() {
  try {
    const { translations, locale } = usePage().props;
    return { translations, locale };
  } catch {
    return {
      translations: {},
      locale: {
        current: 'en',
        available: { en: 'English' },
      },
    };
  }
}

export function useTranslation() {
  const { translations, locale } = getInertiaProps();

  const t = (key, replacements = {}) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string') {
      return Object.keys(replacements).reduce((str, ph) => {
        return str.replace(new RegExp(`:${ph}`, 'g'), replacements[ph]);
      }, value);
    }
    return key;
  };

  const isRTL = () => locale?.current === 'ar';
  const getCurrentLocale = () => locale?.current || 'en';
  const getAvailableLocales = () => locale?.available || {};

  return {
    t,
    isRTL,
    getCurrentLocale,
    getAvailableLocales,
    locale: locale?.current || 'en',
  };
}