import { Card, Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { usePage } from "@inertiajs/react";

export function Welcome() {
  const { t } = useTranslation();
  const { props } = usePage<{ auth: { user: { firstname: string } } }>();
  const userName = props.auth?.user?.firstname || t("common.receptionist") || "Receptionist";

  const now = new Date();
  const hour = now.getHours();
  let greeting = t("common.good_morning") || "Good morning";
  
  if (hour >= 12 && hour < 17) {
    greeting = t("common.good_afternoon") || "Good afternoon";
  } else if (hour >= 17) {
    greeting = t("common.good_evening") || "Good evening";
  }

  return (
    <Card className="col-span-12 flex flex-col bg-gradient-to-r from-primary-500 to-primary-600 p-6 sm:flex-row sm:items-center">
      <div className="flex-1 text-white">
        <h3 className="text-2xl font-semibold">
          {greeting}, <span className="font-bold">{userName}</span>
        </h3>
        <p className="mt-2 text-primary-50">
          {t("common.receptionist_welcome_message") || "Manage appointments and help clients efficiently"}
        </p>
        <p className="mt-1 text-primary-100">
          {t("common.todays_progress") || "Keep up the great work!"} 💪
        </p>

        <Button
          unstyled
          className="mt-6 rounded-lg border border-white/10 bg-white/20 px-5 py-2 text-white hover:bg-white/30 focus:bg-white/30 transition-colors"
        >
          <CalendarDaysIcon className="size-5 mr-2" />
          {t("common.view_all_appointments") || "View All Appointments"}
        </Button>
      </div>
      
      <div className="hidden sm:flex items-center justify-center sm:w-48">
        <div className="text-white/20 text-8xl">📋</div>
      </div>
    </Card>
  );
}

