// Import Dependencies
import { lazy, useMemo } from "react";

// Local Imports
import { Loadable } from "@/components/shared/Loadable";
import { SplashScreen } from "@/components/template/SplashScreen";
import { ThemeLayout } from "@/configs/@types/theme";
import { useThemeContext } from "@/contexts/theme/context";

// ----------------------------------------------------------------------

const themeLayouts: Record<
  ThemeLayout,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  "main-layout": lazy(() => import("./MainLayout")),
  sideblock: lazy(() => import("./Sideblock")),
};

export function DynamicLayout() {
  const { themeLayout } = useThemeContext();

  const CurrentLayout = useMemo(() => {
    return Loadable(
      themeLayouts[themeLayout] || themeLayouts["main-layout"],
      SplashScreen,
    );
  }, [themeLayout]);

  return <CurrentLayout />;
}
