import clsx from "clsx";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

import { Page } from "@/components/shared/Page";
import { Overview } from "./Overview";
import { Statistics } from "./Statistics";
import { Projects } from "./Projects";
import { AppointmentForm } from "./AppointmentForm";
import MainLayout from "@/layouts/MainLayout";
import { Budget } from "./Budget";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage, router } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useDashboardUpdates } from "@/hooks/useDashboardUpdates";

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
  const { props } = usePage();
  const dashboardProps = props as DashboardProps;
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>(
    dashboardProps.todayAppointments || [],
  );
  const [stats, setStats] = useState(
    dashboardProps.statistics || {
      appointments: 0,
      pending: 0,
      cancelled: 0,
      pets: 0,
      clients: 0,
      new_clients: 0,
    },
  );

  const mergeAppointment = useCallback(
    (current: Appointment, incoming: Appointment) => ({
      ...current,
      ...incoming,
      client: { ...current.client, ...incoming.client },
      pet: { ...current.pet, ...incoming.pet },
      consultation: incoming.consultation ?? current.consultation,
    }),
    [],
  );

  const isPendingStatus = (status?: string) =>
    status === "pending" || status === "scheduled";

  // Handle real-time appointment updates via WebSocket
  const handleAppointmentUpdated = useCallback(
    (updatedAppointment: Appointment, meta?: { raw?: any; changes?: any }) => {
      setTodayAppointments((prev) => {
        const index = prev.findIndex(
          (apt) => apt.uuid === updatedAppointment.uuid,
        );
        if (index >= 0) {
          const updated = [...prev];
          const current = updated[index];
          updated[index] = mergeAppointment(current, updatedAppointment);

          // Adjust stats based on status change
          const oldStatus = current.status;
          const newStatus =
            meta?.changes?.status?.new || updatedAppointment.status;
          const prevStatus =
            meta?.changes?.status?.old || oldStatus;
          if (oldStatus && newStatus && oldStatus !== newStatus) {
            setStats((prevStats) => {
              let next = { ...prevStats };
              if (isPendingStatus(prevStatus)) {
                next.pending = Math.max(0, next.pending - 1);
              }
              if (isPendingStatus(newStatus)) {
                next.pending = next.pending + 1;
              }
              if (prevStatus === "cancelled") {
                next.cancelled = Math.max(0, next.cancelled - 1);
              }
              if (newStatus === "cancelled") {
                next.cancelled = next.cancelled + 1;
              }
              return next;
            });
          }
          return updated;
        }

        // If not found, check if it should be added (e.g., status changed to confirmed)
        // Only add if it's for today
        const today = new Date().toISOString().split("T")[0];
        const appointmentDate =
          updatedAppointment.appointment_date instanceof Date
            ? updatedAppointment.appointment_date
                .toISOString()
                .split("T")[0]
            : new Date(updatedAppointment.appointment_date)
                .toISOString()
                .split("T")[0];

        if (appointmentDate === today && updatedAppointment.status !== "cancelled") {
          return [...prev, updatedAppointment];
        }
        return prev;
      });
    },
    [mergeAppointment],
  );

  const handleAppointmentCreated = useCallback(
    (newAppointment: Appointment) => {
      setTodayAppointments((prev) => {
        // Check if appointment already exists
        if (prev.some((apt) => apt.uuid === newAppointment.uuid)) {
          return prev;
        }
        // Only add if it's for today
        const today = new Date().toISOString().split("T")[0];
        const appointmentDate =
          newAppointment.appointment_date instanceof Date
            ? newAppointment.appointment_date.toISOString().split("T")[0]
            : new Date(newAppointment.appointment_date)
                .toISOString()
                .split("T")[0];

        if (appointmentDate === today) {
          return [...prev, newAppointment];
        }
        return prev;
      });

      // Update stats counters
      setStats((prevStats) => ({
        ...prevStats,
        appointments: prevStats.appointments + 1,
        pending:
          prevStats.pending + (isPendingStatus(newAppointment.status) ? 1 : 0),
        cancelled:
          prevStats.cancelled +
          (newAppointment.status === "cancelled" ? 1 : 0),
      }));
    },
    [isPendingStatus],
  );

  // Listen for WebSocket updates
  useDashboardUpdates({
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCreated: handleAppointmentCreated,
  });

  // Polling fallback: Refresh appointments every 20 seconds
  // This ensures updates even if WebSocket/Pusher fails
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const POLL_INTERVAL_MS = 20000; // 20 seconds

    const pollAppointments = () => {
      const now = Date.now();
      // Only poll if we haven't polled recently (debounce)
      if (now - lastPollTimeRef.current < POLL_INTERVAL_MS - 1000) {
        return;
      }
      lastPollTimeRef.current = now;

      // Use Inertia's router.visit to refresh data without full page reload
      router.visit(window.location.pathname, {
        only: ['todayAppointments', 'statistics'],
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page: any) => {
          const newProps = page.props as DashboardProps;
          if (newProps.todayAppointments) {
            setTodayAppointments(newProps.todayAppointments);
          }
          if (newProps.statistics) {
            setStats(newProps.statistics);
          }
        },
      });
    };

    // Start polling
    pollingIntervalRef.current = setInterval(pollAppointments, POLL_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []); // Empty deps - we want this to run once on mount

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
              <Statistics statistics={stats} />
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