import { Progress } from "@/components/ui";
import Logo from "@/layouts/MainLayout/Sidebar/MainPanel/Logo";

export function SplashScreen() {
  return (
    <>
      <div className="fixed grid h-full w-full place-content-center">
      <Logo className="size-28" />
      <Progress
          color="primary"
          isIndeterminate
          animationDuration="1s"
          className="mt-2 h-1"
        />
      </div>
    </>
  );
}
