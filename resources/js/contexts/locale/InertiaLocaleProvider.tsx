import { ReactNode, useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useLocaleContext } from "./context";
import { locales, LocaleCode } from "@/i18n/langs";

interface InertiaLocaleProviderProps {
  children: ReactNode;
}

export function InertiaLocaleProvider({ children }: InertiaLocaleProviderProps) {
  const { props } = usePage();
  const { locale, setDirection } = useLocaleContext();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (props?.locale?.current) {
      const backendLocale = props.locale.current as LocaleCode;
      const localeData = locales[backendLocale];
      
      if (localeData) {
        // Update direction based on backend locale
        setDirection(localeData.dir);
        
        // Update localStorage to match backend
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("i18nextLng", backendLocale);
        }
        
        if (!hasInitialized) {
          setHasInitialized(true);
        }
      }
    }
  }, [props?.locale?.current, setDirection, hasInitialized]);

  return <>{children}</>;
}