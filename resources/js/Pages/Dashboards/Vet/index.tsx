import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Overview } from "./Overview";
import { Statistics } from "./Statistics";
import { Projects } from "./Projects";
import { AppointmentForm } from "./AppointmentForm";
import MainLayout from "@/layouts/MainLayout";
import { Budget } from "./Budget";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";

// ----------------------------------------------------------------------

interface DashboardProps {
  todayAppointments?: Appointment[];
  clients?: Record<string, string>;
  statistics?: {
    appointments: number;
    pending: number;
    cancelled: number;
    pets: number;
    clients: number;
    new_clients: number;
  };
}

export default function CRMAnalytics() {
  const { t } = useTranslation();
  const { rtlProps } = useRTL();
  const { props } = usePage<DashboardProps>();
  const todayAppointments = props.todayAppointments || [];

  return (
    <MainLayout>
      <Page title={t("common.vet_dashboard.page_title")}>
        <div
          {...rtlProps}
          className={clsx("overflow-hidden pb-8", rtlProps.className)}
        >
          <div className="px-(--margin-x) lg:mt-6 lg:gap-6 flex min-w-0 items-center justify-between gap-2">
            <h2 className="truncate text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
              {t("common.vet_dashboard.appointments_overview")}
            </h2>
          </div>
          <div className="transition-content grid grid-cols-12 gap-4 px-(--margin-x) sm:mt-4 sm:gap-5">
            <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-5 lg:col-span-8 lg:gap-6">
              <Overview />
              <Statistics statistics={props.statistics} />
              <Projects todayAppointments={todayAppointments} />
            </div>
            <div className="col-span-12 lg:col-span-4 gap-4 sm:gap-5 lg:gap-6">
              <AppointmentForm />
              <Budget />
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}