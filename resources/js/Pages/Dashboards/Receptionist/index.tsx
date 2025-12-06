import clsx from "clsx";
import { Page } from "@/components/shared/Page";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { QuickStats } from "./QuickStats";
import { TodayAppointments } from "./TodayAppointments";
import { AppointmentRequests } from "./AppointmentRequests";
import { QuickSchedule } from "./QuickSchedule";
import { Welcome } from "./Welcome";

// ----------------------------------------------------------------------

interface ReceptionistDashboardProps {
  todayAppointments?: Appointment[];
  pendingAppointments?: Appointment[];
  stats?: {
    todayTotal: number;
    pendingRequests: number;
    completedToday: number;
    cancelledToday: number;
  };
  clients?: Record<string, string>;
  veterinarians?: Array<{ uuid: string; name: string }>;
}

export default function ReceptionistDashboard() {
  const { t } = useTranslation();
  const { rtlProps } = useRTL();
  const { props } = usePage<ReceptionistDashboardProps>();
  
  const todayAppointments = props.todayAppointments || [];
  const pendingAppointments = props.pendingAppointments || [];
  const stats = props.stats || {
    todayTotal: 0,
    pendingRequests: 0,
    completedToday: 0,
    cancelledToday: 0,
  };
  const clients = props.clients || {};
  const veterinarians = props.veterinarians || [];

  return (
    <MainLayout>
      <Page title={t("common.receptionist_dashboard") || "Receptionist Dashboard"}>
        <div className="transition-content w-full px-(--margin-x) pb-8">
          <div className="mt-4 grid grid-cols-12 gap-4 sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
            {/* Main Content Column */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
              {/* Welcome Banner 
              <Welcome />*/}

              {/* Quick Stats */}
                <QuickStats stats={stats} />

              {/* Pending Requests */}
              <AppointmentRequests appointments={pendingAppointments} />

              {/* Today's Appointments */}
              <TodayAppointments appointments={todayAppointments} />
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-20 lg:self-start">
                <QuickSchedule 
                  clients={clients}
                />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

