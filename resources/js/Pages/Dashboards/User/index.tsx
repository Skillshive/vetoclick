import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Statistics } from "./Statistics";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { QuickActions } from "./QuickActions";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";

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
          className={clsx("overflow-hidden pb-8", rtlProps.className)}
        >
          <div className="transition-content px-(--margin-x) pb-8 mt-5 lg:mt-6">
            <Statistics statistics={statistics} />
            <div className="mt-4 grid grid-cols-12 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
              <div className="col-span-12 lg:col-span-8">
                <UpcomingAppointments appointments={upcomingAppointments} />
              </div>
              <div className="col-span-12 lg:col-span-4">
                <QuickActions />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

