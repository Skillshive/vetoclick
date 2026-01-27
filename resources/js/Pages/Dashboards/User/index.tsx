import clsx from "clsx";

import { Page } from "@/components/shared/Page";
import { Statistics } from "./Statistics";
import { UpcomingAppointments } from "./UpcomingAppointments";
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
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

