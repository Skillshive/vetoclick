// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Fragment } from "react";

// Local Imports
import { Button, Card } from "@/components/ui";

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

  const appointmentsToShow = todayAppointments && todayAppointments.length > 0 
    ? todayAppointments.map(appointment => ({
        ...appointment,
        appointment_date: appointment.appointment_date instanceof Date 
          ? appointment.appointment_date 
          : new Date(appointment.appointment_date),
        pet: {
          ...appointment.pet,
          dob: appointment.pet?.dob 
            ? (appointment.pet.dob instanceof Date ? appointment.pet.dob : new Date(appointment.pet.dob))
            : new Date(), // Provide default date if undefined
        }
      }))
    : [];

  return (
    <Card className="col-span-12 py-2">
      <div className="flex min-w-0 items-center justify-between px-4 py-3">
        
        <h2 className="dark:text-dark-100 min-w-0 font-medium tracking-wide text-gray-800">
          {t("common.vet_dashboard.projects.today_appointments")}
        </h2>
        {/* <ActionMenu /> */}
      </div>
      <div className="hide-scrollbar transition-content col-span-12 flex gap-4 overflow-x-auto px-(--margin-x) lg:col-span-9 lg:ltr:pl-0 lg:rtl:pr-0">
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

function ActionMenu() {
  const { t } = useTranslation();

  return (
    <Menu
      as="div"
      className="relative inline-block text-left ltr:-mr-1.5 rtl:-ml-1.5"
    >
      <MenuButton
        as={Button}
        variant="flat"
        isIcon
        className="size-8 rounded-full"
      >
        <EllipsisHorizontalIcon className="size-5" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out"
        enterFrom="opacity-0 translate-y-2"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-2"
      >
        <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none">
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                )}
              >
                <span>{t("common.vet_dashboard.action_menu.action")}</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                )}
              >
                <span>{t("common.vet_dashboard.action_menu.another_action")}</span>
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                )}
              >
                <span>{t("common.vet_dashboard.action_menu.other_action")}</span>
              </button>
            )}
          </MenuItem>

          <hr className="border-gray-150 dark:border-dark-500 mx-3 my-1.5 h-px" />

          <MenuItem>
            {({ focus }) => (
              <button
                className={clsx(
                  "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                  focus &&
                    "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                )}
              >
                <span>{t("common.vet_dashboard.action_menu.separated_action")}</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
