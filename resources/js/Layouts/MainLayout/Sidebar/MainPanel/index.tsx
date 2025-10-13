import { Link } from "@inertiajs/react";
import clsx from "clsx";

import { Menu } from "./Menu";
import { Profile } from "../../Profile";
import { NavigationTree } from "@/@types/navigation";
import { useThemeContext } from "@/contexts/theme/context";
import { Logo } from "./Logo";
import { SettingsButton } from "./SettingsButton";


interface MainPanelProps {
  nav?: NavigationTree[];
}

export function MainPanel({
  nav,
}: MainPanelProps) {
  const { cardSkin } = useThemeContext();

  return (
    <div className="main-panel">
      <div
        className={clsx(
          "border-gray-150 dark:border-dark-600/80 flex h-full w-full flex-col items-center bg-white ltr:border-r rtl:border-l",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        <div className="flex pt-3.5">
          <Link href="/">
            <Logo className="size-10" />
          </Link>
        </div>

        <Menu nav={nav} />

        <div className="flex flex-col items-center space-y-3 py-2.5">
          <SettingsButton />
          <Profile />
        </div>
      </div>
    </div>
  );
}
