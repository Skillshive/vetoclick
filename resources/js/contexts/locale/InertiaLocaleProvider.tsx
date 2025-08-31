import { ReactNode, useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { router } from "@inertiajs/react";
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
    if (props?.locale?.current && !hasInitialized) {
      const backendLocale = props.locale.current as LocaleCode;
      const frontendLocale = locale; // From localStorage
      
      console.log('Backend locale:', backendLocale);
      console.log('Frontend locale:', frontendLocale);
      
      // If there's a mismatch and frontend locale is valid, sync to backend
      if (frontendLocale !== backendLocale && locales[frontendLocale]) {
        console.log('Syncing frontend locale to backend:', frontendLocale);
        router.get(`/language/switch/${frontendLocale}`, {
          preserveState: false,
          preserveScroll: false,
        });
        return;
      }
      
      // Set direction based on current locale
      const localeData = locales[backendLocale];
      if (localeData) {
        setDirection(localeData.dir);
      }
      
      setHasInitialized(true);
    }
  }, [props?.locale?.current, locale, setDirection, hasInitialized]);

  return <>{children}</>;
}