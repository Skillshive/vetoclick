import { useState, useCallback, ReactNode, useLayoutEffect } from "react";

import { LocaleContext } from "./context";

const defaultLang = 'en';
type LocaleCode = string;
type Dir = 'ltr' | 'rtl';

const initialLang: LocaleCode =
  ((typeof localStorage !== "undefined" &&
    localStorage.getItem("i18nextLng")) as LocaleCode) || defaultLang;

const initialDir: Dir = 'ltr';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleCode>(initialLang);
  const [direction, setDirection] = useState<Dir>(initialDir as Dir);

  const updateLocale = useCallback(async (newLocale: LocaleCode) => {
    setLocale(newLocale);
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <LocaleContext
      value={{
        locale,
        updateLocale,
        direction,
        setDirection,
        isRtl: direction === "rtl",
      }}
    >
      {children}
    </LocaleContext>
  );
}
