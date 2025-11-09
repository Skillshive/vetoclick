import { useLocaleContext } from '@/contexts/locale/context';
import { usePage } from '@inertiajs/react';

export function useTranslation() {
  const { locale, isRtl } = useLocaleContext();
  const { translations } = usePage().props;

  const t = (key: string, replacements: Record<string, string | number> = {}): string => {
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
      return Object.keys(replacements).reduce((str, placeholder) => {
        const regex = new RegExp(`:${placeholder}\\b`, 'g');
        return str.replace(regex, String(replacements[placeholder]));
      }, value);
    }

    return key;
  };

  const getCurrentLocale = () => {
    return locale;
  };

  const isCurrentLocaleRTL = () => {
    return isRtl;
  };

  return {
    t,
    locale,
    isRTL: isCurrentLocaleRTL,
    getCurrentLocale,
  };
}