// Import Dependencies
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useMemo, useState, useEffect } from "react";

// Local Imports
import { Card } from "@/components/ui";

import { ColorType } from "@/constants/app";
import { AppointmentCard } from "../TopSellers/AppointmentCard";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface TeamMember {
  uid: string;
  name: string;
  avatar?: string;
}

export interface Project {
  uid: number;
  name: string;
  description: string;
  color: ColorType;
  category: string;
  progress: number;
  created_at: string;
  teamMembers: TeamMember[];
}


interface ProjectsProps {
  todayAppointments?: Appointment[];
}


export function Projects({ todayAppointments = [] }: ProjectsProps) {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds to reorder appointments and update button states
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds for more responsive updates

    return () => clearInterval(interval);
  }, []);

  const appointmentsToShow = useMemo(() => {
    if (!todayAppointments || todayAppointments.length === 0) {
      return [];
    }

    const now = currentTime;

    const mapped = todayAppointments.map(appointment => {
      const appointmentDate = appointment.appointment_date instanceof Date 
        ? appointment.appointment_date 
        : new Date(appointment.appointment_date);
      
      const [endHours, endMinutes] = appointment.end_time.split(':').map(Number);
      const endDateTime = new Date(appointmentDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
      const latestAccess = new Date(endDateTime.getTime() + 30 * 60 * 1000); // 30 minutes after end
      
      const isPast = now > latestAccess;

      // Calculate start time for sorting
      const [startHours, startMinutes] = appointment.start_time.split(':').map(Number);
      const startDateTime = new Date(appointmentDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      return {
        ...appointment,
        appointment_date: appointmentDate,
        isPast,
        startDateTime: startDateTime.getTime(),
        endDateTime: endDateTime.getTime(),
        pet: {
          ...appointment.pet,
          dob: appointment.pet?.dob 
            ? (appointment.pet.dob instanceof Date ? appointment.pet.dob : new Date(appointment.pet.dob))
            : new Date(), // Provide default date if undefined
        }
      };
    });

    // Sort: current/upcoming appointments first (by start_time), then past appointments at the end (by start_time)
    return mapped.sort((a, b) => {
      // First separate past and current/upcoming appointments
      if (a.isPast !== b.isPast) {
        return a.isPast ? 1 : -1; // Past appointments go to the end
      }
      
      // Within the same category, sort by start_time (earliest first)
      return a.startDateTime - b.startDateTime;
    });
  }, [todayAppointments, currentTime]);

  return (
    <Card className="col-span-12 py-2">
      <div className="flex min-w-0 items-center justify-between px-4 py-3">
        
        <h2 className="dark:text-dark-100 min-w-0 font-medium tracking-wide text-gray-800">
          {t("common.vet_dashboard.projects.today_appointments")}
        </h2>
      </div>
      <div className="hide-scrollbar flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden px-4 pb-2">
        {appointmentsToShow.length > 0 ? (
          appointmentsToShow.map((appointment) => (
            <AppointmentCard key={appointment.uuid} appointment={appointment} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-12 px-4">
            <CalendarDaysIcon className="size-16 mb-4 text-gray-400 dark:text-gray-500 opacity-50" />
            <p className="text-gray-500 dark:text-gray-400 text-center font-medium">
              {t("common.vet_dashboard.projects.no_appointments_today") || "No appointments scheduled for today"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}