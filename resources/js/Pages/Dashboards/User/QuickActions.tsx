// Import Dependencies
import { Link } from "@inertiajs/react";
import { useState } from "react";
import {
  CalendarIcon,
  HeartIcon,
  DocumentTextIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { AppointmentFormModal } from "@/components/modals/AppointmentFormModal";
import { PawPrint } from "lucide-react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function QuickActions() {
  const { t } = useTranslation();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isVideoConsultation, setIsVideoConsultation] = useState(false);

  const getColorClasses = (color: string, type: 'bg' | 'text') => {
    const colorMap: Record<string, Record<string, string>> = {
      primary: {
        bg: 'bg-primary-100 dark:bg-primary-900/20',
        text: 'text-primary-600 dark:text-primary-400',
      },
      info: {
        bg: 'bg-primary-100 dark:bg-primary-900/20',
        text: 'text-primary-600 dark:text-primary-400',
      },
      success: {
        bg: 'bg-primary-100 dark:bg-primary-900/20',
        text: 'text-primary-600 dark:text-primary-400',
      },
      secondary: {
        bg: 'bg-primary-100 dark:bg-primary-900/20',
        text: 'text-primary-600 dark:text-primary-400',
      },
    };
    return colorMap[color]?.[type] || colorMap.primary[type];
  };

  const actions = [
    {
      id: "schedule",
      label: t("common.user_dashboard.quick_actions.schedule") || "Schedule Appointment",
      icon: CalendarIcon,
      href: undefined as string | undefined,
      color: "primary" as const,
      onClick: () => {
        setIsVideoConsultation(false);
        setIsAppointmentModalOpen(true);
      },
    },
    {
      id: "video",
      label: t("common.user_dashboard.quick_actions.video_consultation") || "Video Consultation",
      icon: VideoCameraIcon,
      href: undefined as string | undefined,
      color: "info" as const,
      onClick: () => {
        setIsVideoConsultation(true);
        setIsAppointmentModalOpen(true);
      },
    },
    {
      id: "pets",
      label: t("common.user_dashboard.quick_actions.add_pet") || "Add Pet",
      icon: HeartIcon,
      href: route("pets.create"),
      color: "success" as const,
      onClick: undefined as (() => void) | undefined,
    },
    {
      id: "records",
      label: t("common.view_pets") || "View Pets",
      icon: PawPrint,
      href: route("pets.index"),
      color: "secondary" as const,
      onClick: undefined as (() => void) | undefined,
    },
  ];

  return (
    <>
      <Card className="px-4 pb-4 sm:px-5">
        <div className="flex h-14 min-w-0 items-center justify-between py-3">
          <h2 className="font-medium tracking-wide text-gray-800 dark:text-dark-100">
            {t("common.user_dashboard.quick_actions.title") || "Quick Actions"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const className = "flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-300 hover:bg-primary-50 dark:border-dark-500 dark:hover:border-primary-600 dark:hover:bg-primary-900/10";
            
            if (action.onClick) {
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  type="button"
                  className={className}
                >
                  <div className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", getColorClasses(action.color, 'bg'))}>
                    <action.icon className={clsx("size-5", getColorClasses(action.color, 'text'))} />
                  </div>
                  <span className="text-xs text-center font-medium text-gray-700 dark:text-dark-200">
                    {action.label}
                  </span>
                </button>
              );
            }
            
            return (
            <Link
              key={action.id}
              href={action.href || '#'}
              className={className}
            >
                <div className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", getColorClasses(action.color, 'bg'))}>
                  <action.icon className={clsx("size-5", getColorClasses(action.color, 'text'))} />
                </div>
                <span className="text-xs text-center font-medium text-gray-700 dark:text-dark-200">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>
      <AppointmentFormModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setIsVideoConsultation(false);
        }}
        initialVideoConsultation={isVideoConsultation}
      />
    </>
  );
}

