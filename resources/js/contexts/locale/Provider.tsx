import { useState, useCallback, ReactNode, useLayoutEffect } from "react";
import { LocaleContext } from "./context";
import { locales, LocaleCode, Dir } from "@/i18n/langs";

const defaultLang: LocaleCode = 'en';

// Get initial language from localStorage or default
const getInitialLang = (): LocaleCode => {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("i18nextLng") as LocaleCode;
    if (stored && locales[stored]) {
      return stored;
    }
  }
  return defaultLang;
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const initialLang = getInitialLang();
  const [locale, setLocale] = useState<LocaleCode>(initialLang);
  const [direction, setDirection] = useState<Dir>(locales[initialLang]?.dir || 'ltr');

  const updateLocale = useCallback(async (newLocale: LocaleCode) => {
    if (locales[newLocale]) {
      // Update state immediately for responsive UI
      setLocale(newLocale);
      setDirection(locales[newLocale].dir);
      
      // Update localStorage for persistence
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("i18nextLng", newLocale);
      }
      
      // Set cookie for backend to read
      if (typeof document !== "undefined") {
        document.cookie = `i18nextLng=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
      }

      // Navigate to backend route to update session
      try {
        window.location.href = `/language/switch/${newLocale}`;
      } catch (error) {
        console.error('Failed to switch language:', error);
      }
    }
  }, []);

  const internalSetDirection = useCallback((newDirection: Dir) => {
    setDirection(newDirection);
  }, []);

  useLayoutEffect(() => {
    // Update document direction and locale
    document.documentElement.dir = direction;
    document.documentElement.lang = locale;
    
    // Update body class for styling
    document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
    document.body.classList.add(direction);
    
    // Font family is now handled by CSS
    
    // Set cookie for backend to read on initial load
    if (typeof document !== "undefined") {
      document.cookie = `i18nextLng=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 year
    }
  }, [direction, locale]);

  return (
    <LocaleContext
      value={{
        locale,
        updateLocale,
        direction,
        setDirection: internalSetDirection,
        isRtl: direction === "rtl",
      }}
    >
      {children}
    </LocaleContext>
  );
}
