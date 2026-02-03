import clsx from "clsx";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Page } from "@/components/shared/Page";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { usePage, router } from "@inertiajs/react";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { QuickStats } from "./QuickStats";
import { TodayAppointments } from "./TodayAppointments";
import { AppointmentRequests } from "./AppointmentRequests";
import { QuickSchedule } from "./QuickSchedule";
import { Welcome } from "./Welcome";
import { useDashboardUpdates } from "@/hooks/useDashboardUpdates";

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
  veterinaryId?: string;
}

export default function ReceptionistDashboard() {
  const { t } = useTranslation();
  const { rtlProps } = useRTL();
  const { props } = usePage();
  const dashboardProps = props as ReceptionistDashboardProps;
  
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>(
    dashboardProps.todayAppointments || [],
  );
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    dashboardProps.pendingAppointments || [],
  );

  // Handle real-time appointment updates via WebSocket
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

  const handleAppointmentUpdated = useCallback((updatedAppointment: Appointment, meta?: { raw?: any; changes?: any }) => {
    // Update today's appointments
    setTodayAppointments((prev) => {
      const index = prev.findIndex((apt) => apt.uuid === updatedAppointment.uuid);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = mergeAppointment(updated[index], updatedAppointment);
        return updated;
      }
      // If status changed to confirmed/scheduled and it's for today, add it
      const today = new Date().toISOString().split('T')[0];
      const appointmentDate = updatedAppointment.appointment_date instanceof Date
        ? updatedAppointment.appointment_date.toISOString().split('T')[0]
        : new Date(updatedAppointment.appointment_date).toISOString().split('T')[0];
      
      if (appointmentDate === today && 
          (updatedAppointment.status === 'confirmed' || updatedAppointment.status === 'scheduled')) {
        return [...prev, updatedAppointment];
      }
      return prev;
    });

    // Update pending appointments
    setPendingAppointments((prev) => {
      const index = prev.findIndex((apt) => apt.uuid === updatedAppointment.uuid);
      if (index >= 0) {
        // If status changed from pending/scheduled, remove it
        const newStatus = meta?.changes?.status?.new || updatedAppointment.status;
        if (newStatus === 'confirmed' || newStatus === 'cancelled') {
          return prev.filter((apt) => apt.uuid !== updatedAppointment.uuid);
        }
        // Otherwise update it
        const updated = [...prev];
        updated[index] = updatedAppointment;
        return updated;
      }
      // If status is pending/scheduled, add it
      if (updatedAppointment.status === 'pending' || updatedAppointment.status === 'scheduled') {
        return [...prev, updatedAppointment];
      }
      return prev;
    });
  }, [mergeAppointment]);

  const handleAppointmentCreated = useCallback((newAppointment: Appointment) => {
    const today = new Date().toISOString().split('T')[0];
    const appointmentDate = newAppointment.appointment_date instanceof Date
      ? newAppointment.appointment_date.toISOString().split('T')[0]
      : new Date(newAppointment.appointment_date).toISOString().split('T')[0];

    // Add to today's appointments if it's for today
    if (appointmentDate === today) {
      setTodayAppointments((prev) => {
        if (prev.some((apt) => apt.uuid === newAppointment.uuid)) {
          return prev;
        }
        return [...prev, newAppointment];
      });
    }

    // Add to pending if status is pending/scheduled
    if (newAppointment.status === 'pending' || newAppointment.status === 'scheduled') {
      setPendingAppointments((prev) => {
        if (prev.some((apt) => apt.uuid === newAppointment.uuid)) {
          return prev;
        }
        return [...prev, newAppointment];
      });
    }
  }, []);

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
        only: ['todayAppointments', 'pendingAppointments', 'stats'],
        preserveScroll: true,
        preserveState: true,
        onSuccess: (page: any) => {
          const newProps = page.props as ReceptionistDashboardProps;
          if (newProps.todayAppointments) {
            setTodayAppointments(newProps.todayAppointments);
          }
          if (newProps.pendingAppointments) {
            setPendingAppointments(newProps.pendingAppointments);
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

  const stats = useMemo(() => {
    const completedToday = todayAppointments.filter(
      (apt) => apt.status === "completed",
    ).length;
    const cancelledToday = todayAppointments.filter(
      (apt) => apt.status === "cancelled",
    ).length;
    return {
      todayTotal: todayAppointments.length,
      pendingRequests: pendingAppointments.length,
      completedToday,
      cancelledToday,
    };
  }, [todayAppointments, pendingAppointments]);
  const clients = dashboardProps.clients || {};
  const veterinarians = dashboardProps.veterinarians || [];
  const veterinaryId = dashboardProps.veterinaryId || null;

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.receptionist_dashboard") || "Receptionist Dashboard"}
        description={t("common.receptionist_dashboard.page_description") || "Manage appointment requests, schedule appointments, and handle daily clinic operations efficiently."}
      >
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
                  veterinaryId={veterinaryId}
                />
              </div>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}

