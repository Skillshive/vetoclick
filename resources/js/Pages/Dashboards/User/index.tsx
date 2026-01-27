import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Statistics } from "./Statistics";
import { UpcomingAppointments } from "./UpcomingAppointments";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { Card, Avatar, Button } from "@/components/ui";
import {
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

interface DashboardProps {
  upcomingAppointments?: Appointment[];
  statistics?: {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    videoConsultations: number;
    totalPets: number;
  };
  client?: Client;
}

// ----------------------------------------------------------------------
// Local overview panels (My Doctors / Prescriptions / Recent Activity)

function MyDoctorsPanel() {
  const { t } = useTranslation();

  const doctors = [
    { id: 1, name: "Dr. Mick Thompson", role: "Cardiologist", bookings: 20 },
    { id: 2, name: "Dr. Sarah Johnson", role: "Orthopedic Surgeon", bookings: 15 },
    { id: 3, name: "Dr. Emily Carter", role: "Pediatrician", bookings: 12 },
    { id: 4, name: "Dr. David Lee", role: "Gynecologist", bookings: 8 },
  ];

  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.my_doctors") || "My Doctors"}
        </h2>
      </div>
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-800/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                size={9}
                name={doctor.name}
                classNames={{ display: "rounded-full" }}
                initialColor="auto"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-dark-50">
                  {doctor.name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-dark-300">
                  {doctor.role}
                </p>
              </div>
            </div>
            <span className="whitespace-nowrap rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {doctor.bookings.toString().padStart(2, "0")}{" "}
              {t("common.user_dashboard.bookings") || "Bookings"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PrescriptionsPanel() {
  const { t } = useTranslation();

  const prescriptions = [
    { id: 1, title: "Cardiology Prescription", date: "20 Apr 2025" },
    { id: 2, title: "Dentist Prescription", date: "25 Mar 2025" },
    { id: 3, title: "Dentist Prescription", date: "16 Mar 2025" },
    { id: 4, title: "Dentist Prescription", date: "12 Feb 2025" },
  ];

  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.prescriptions") || "Prescriptions"}
        </h2>
      </div>
      <div className="space-y-3">
        {prescriptions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-800/60"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
                <DocumentTextIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-dark-50">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-300">
                  {item.date}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                isIcon
                size="xs"
                variant="ghost"
                className="text-gray-500 hover:text-primary-600"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                isIcon
                size="xs"
                variant="ghost"
                className="text-gray-500 hover:text-primary-600"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentActivityPanel() {
  const { t } = useTranslation();

  const activities = [
    {
      id: 1,
      color: "bg-emerald-500",
      title: "Appointment with Primary Care Physician",
      date: "24 Mar 2025, 10:55 AM",
    },
    {
      id: 2,
      color: "bg-rose-500",
      title: "Blood Pressure Check (Home)",
      date: "24 Apr 2025, 11:00 AM",
    },
    {
      id: 3,
      color: "bg-amber-400",
      title: "Physical Therapy Session",
      date: "24 Apr 2025, 11:00 AM",
    },
    {
      id: 4,
      color: "bg-blue-500",
      title: "Discuss dietary changes",
      date: "24 Apr 2025, 11:00 AM",
    },
  ];

  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.recent_activity") || "Recent Activity"}
        </h2>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span
                className={clsx(
                  "h-2.5 w-2.5 rounded-full border-2 border-white dark:border-dark-900",
                  activity.color
                )}
              />
              {index !== activities.length - 1 && (
                <span className="mt-1 h-full w-px bg-gray-200 dark:bg-dark-600" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-50">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-300">
                {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function UserDashboard() {
  const { t } = useTranslation();
  const { rtlProps } = useRTL();
  const { props } = usePage();
  
  const dashboardProps = props as DashboardProps;
  const upcomingAppointments = dashboardProps.upcomingAppointments || [];
  const statistics = dashboardProps.statistics || {
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    videoConsultations: 0,
    totalPets: 0,
  };

  return (
    <MainLayout>
      <Page title={t("common.user_dashboard.page_title") || "My Dashboard"}>
        <div
          {...rtlProps}
          className={clsx("overflow-hidden", rtlProps.className)}
        >
          <div className="transition-content px-(--margin-x) py-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
              <div className="col-span-12 lg:col-span-8">
                <UpcomingAppointments appointments={upcomingAppointments} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <Statistics statistics={statistics} />
              </div>
            </div>

            {/* Secondary overview section */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6 xl:grid-cols-3">
              <MyDoctorsPanel />
              <PrescriptionsPanel />
              <RecentActivityPanel />
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

