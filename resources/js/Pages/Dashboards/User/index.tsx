import clsx from "clsx";
import { useState, useCallback, useEffect } from "react";

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
  DocumentTextIcon,
  UserIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Loader } from "lucide-react";
import { useDashboardUpdates } from "@/hooks/useDashboardUpdates";

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

interface Doctor {
  id: number;
  name: string;
  city: string;
  total_consultations: number;
}

function MyDoctorsPanel() {
  const { t } = useTranslation();
  const [ doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const handleRefreshData = () => {
    setLoading(true);
    fetch(route('user.dashboard.my_doctors'))
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch doctors');
        }
      })
      .then(data => {
        setDoctors(data);
      })
      .catch(error => console.error('Error fetching doctors:', error))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    handleRefreshData();
  }, []);

  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.my_doctors") || "My Doctors"}
        </h2>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <Loader className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-4">
            <UserIcon className="h-9 w-9 mb-2 text-gray-300 dark:text-dark-500" />
            <div className="text-center text-xs text-gray-500 dark:text-dark-400">
              {t("common.user_dashboard.no_doctors") || "No doctors found"}
            </div>
          </div>
        ) : (
          doctors.map((doctor) => (
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
                    {doctor.city}
                  </p>
                </div>
              </div>
              <span className="whitespace-nowrap rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-600 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">
                {doctor.total_consultations.toString().padStart(2, "0")}{" "}
                {t("common.user_dashboard.consultations") || "Consultations"}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
}

function PrescriptionsPanel() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const handleRefreshData = () => {
    setLoading(true);
    fetch(route('user.dashboard.last_prescriptions'))
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch prescriptions');
        }
      })
      .then(data => {
        setPrescriptions(data);
      })
      .catch(error => console.error('Error fetching prescriptions:', error))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    handleRefreshData();
  }, []);
  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.prescriptions") || "Prescriptions"}
        </h2>
      </div>
      <div className="flex flex-col h-full py-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <DocumentTextIcon className="h-9 w-9 mb-2 text-gray-300 dark:text-dark-500" />
            <div className="text-center text-xs text-gray-500 dark:text-dark-400">
              {t("common.user_dashboard.no_prescriptions") || "No prescriptions"}
            </div>
          </div>
        ) : (
          prescriptions.map((item) => (
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
                    {item.medication}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-300">
                    {item.dosage} x {item.frequency}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

interface Activity {
  id: string;
  type: string;
  color: string;
  title: string;
  date: string;
  created_at: string;
}

function RecentActivityPanel() {
  const { t, locale } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const formatActivityDate = (dateString: string): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
      
      // Format date based on locale
      const formattedDate = date.toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      
      // Format time in 24-hour format
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      return `${formattedDate}, ${formattedTime}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleRefreshData = () => {
    setLoading(true);
    fetch(route('user.dashboard.recent_activities'))
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch recent activities');
        }
      })
      .then(data => {
        setActivities(data);
      })
      .catch(error => console.error('Error fetching recent activities:', error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleRefreshData();
  }, []);

  return (
    <Card className="h-full px-4 py-4 sm:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-50">
          {t("common.user_dashboard.recent_activity") || "Recent Activity"}
        </h2>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <Loader className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-4">
            <ClockIcon className="h-9 w-9 mb-2 text-gray-300 dark:text-dark-500" />
            <div className="text-center text-xs text-gray-500 dark:text-dark-400">
              {t("common.user_dashboard.no_recent_activity") || "No recent activity"}
            </div>
          </div>
        ) : (
          activities.map((activity, index) => (
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
                  {formatActivityDate(activity.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default function UserDashboard() {
  const { t } = useTranslation();
  const { rtlProps } = useRTL();
  const { props } = usePage();
  
  const dashboardProps = props as DashboardProps;
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>(
    dashboardProps.upcomingAppointments || [],
  );
  const [statistics, setStatistics] = useState(
    dashboardProps.statistics || {
      totalAppointments: 0,
      upcomingAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      videoConsultations: 0,
      totalPets: 0,
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

  // Handle real-time appointment updates via WebSocket
  const handleAppointmentUpdated = useCallback((updatedAppointment: Appointment, meta?: { raw?: any; changes?: any }) => {
    setUpcomingAppointments((prev) => {
      const index = prev.findIndex((apt) => apt.uuid === updatedAppointment.uuid);
      if (index >= 0) {
        // Update existing appointment
        const updated = [...prev];
        updated[index] = mergeAppointment(updated[index], updatedAppointment);
        // Remove if cancelled or completed (depending on requirements)
        const newStatus = meta?.changes?.status?.new || updatedAppointment.status;
        if (newStatus === 'cancelled') {
          return updated.filter((apt) => apt.uuid !== updatedAppointment.uuid);
        }
        return updated;
      }
      // If status is upcoming and not cancelled, add it
      if (updatedAppointment.status !== 'cancelled' && updatedAppointment.status !== 'completed') {
        const appointmentDate = updatedAppointment.appointment_date instanceof Date
          ? updatedAppointment.appointment_date
          : new Date(updatedAppointment.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);
        
        if (appointmentDate >= today) {
          return [...prev, updatedAppointment];
        }
      }
      return prev;
    });
  }, [mergeAppointment]);

  const handleAppointmentCreated = useCallback((newAppointment: Appointment) => {
    setUpcomingAppointments((prev) => {
      // Check if appointment already exists
      if (prev.some((apt) => apt.uuid === newAppointment.uuid)) {
        return prev;
      }
      // Only add if it's upcoming (not cancelled/completed)
      if (newAppointment.status !== 'cancelled' && newAppointment.status !== 'completed') {
        const appointmentDate = newAppointment.appointment_date instanceof Date
          ? newAppointment.appointment_date
          : new Date(newAppointment.appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);
        
        if (appointmentDate >= today) {
          return [...prev, newAppointment];
        }
      }
      return prev;
    });
  }, []);

  // Keep stats in sync with upcoming appointments count
  useEffect(() => {
    setStatistics((prevStats) => ({
      ...prevStats,
      upcomingAppointments: upcomingAppointments.length,
    }));
  }, [upcomingAppointments]);

  // Listen for WebSocket updates
  useDashboardUpdates({
    onAppointmentUpdated: handleAppointmentUpdated,
    onAppointmentCreated: handleAppointmentCreated,
  });

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.user_dashboard") || "My Dashboard"}
        description={t("common.user_dashboard.page_description") || "View your upcoming appointments, manage your pets, and access your medical records all in one place."}
      >
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

