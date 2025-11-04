// Import Dependencies
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment } from "react";

// Local Imports
import { Button, Card } from "@/components/ui";

import { ColorType } from "@/constants/app";
import { AppointmentCard } from "../TopSellers/AppointmentCard";
import { Appointment } from "@/pages/Appointments/datatable/types";

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


export const appointments: Appointment[] = [
  {
    uuid: "a1b2c3d4",
    client: {
      uuid: "c001",
      first_name: "Sarah",
      last_name: "Johnson",
      avatar: "https://randomuser.me/api/portraits/women/21.jpg"
    },
    pet: {
      uuid: "p001",
      name: "Bella",
      breed: "Golden Retriever",
      avatar: "https://placedog.net/400/400?id=1",
      microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Routine Check-up",
    appointment_date: new Date("2025-11-10"),
    start_time: "10:00",
    end_time: "10:30",
    duration_minutes: 30,
    status: "confirmed",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Annual vaccination and check-up",
    appointment_notes: "Pet is in good health.",
    created_at: "2025-10-25T09:45:00Z"
  },
  {
    uuid: "b2c3d4e5",
    client: {
      uuid: "c002",
      first_name: "Mohamed",
      last_name: "Amrani",
      avatar: "https://randomuser.me/api/portraits/men/31.jpg"
    },
    pet: {
      uuid: "p002",
      name: "Simba",
      breed: "Siamese Cat",
      avatar: "https://placedog.net/400/400?id=3",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Consultation",
    appointment_date: new Date("2025-11-11"),
    start_time: "14:00",
    end_time: "14:45",
    duration_minutes: 45,
    status: "pending",
    is_video_conseil: true,
    video_meeting_id: "vid-001",
    video_join_url: "https://meet.vetapp.com/join/vid-001",
    reason_for_visit: "Loss of appetite",
    appointment_notes: "Owner suspects dental issue.",
    created_at: "2025-10-27T12:20:00Z"
  },
  {
    uuid: "c3d4e5f6",
    client: {
      uuid: "c003",
      first_name: "Emma",
      last_name: "Dupont",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg"
    },
    pet: {
      uuid: "p003",
      name: "Luna",
      breed: "Beagle",
      avatar: "https://placedog.net/400/400?id=2",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Dental Cleaning",
    appointment_date: new Date("2025-11-12"),
    start_time: "09:00",
    end_time: "09:30",
    duration_minutes: 30,
    status: "confirmed",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Routine dental cleaning",
    appointment_notes: "Recommend follow-up in 6 months.",
    created_at: "2025-10-28T08:10:00Z"
  },
  {
    uuid: "d4e5f6g7",
    client: {
      uuid: "c004",
      first_name: "Youssef",
      last_name: "El Fassi",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg"
    },
    pet: {
      uuid: "p004",
      name: "Rocky",
      breed: "Bulldog",
      avatar: "https://placedog.net/400/400?id=3",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Surgery Follow-up",
    appointment_date: new Date("2025-11-13"),
    start_time: "11:30",
    end_time: "12:00",
    duration_minutes: 30,
    status: "completed",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Post-surgery evaluation",
    appointment_notes: "Healing well, no complications.",
    created_at: "2025-10-29T15:00:00Z"
  },
  {
    uuid: "e5f6g7h8",
    client: {
      uuid: "c005",
      first_name: "Laura",
      last_name: "Benitez",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg"
    },
    pet: {
      uuid: "p005",
      name: "Milo",
      breed: "Persian Cat",
      avatar: "https://placedog.net/400/400?id=3",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Vaccination",
    appointment_date: new Date("2025-11-14"),
    start_time: "16:00",
    end_time: "16:20",
    duration_minutes: 20,
    status: "confirmed",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Rabies vaccination",
    appointment_notes: "Administered successfully.",
    created_at: "2025-10-29T16:00:00Z"
  },
  {
    uuid: "f6g7h8i9",
    client: {
      uuid: "c006",
      first_name: "Ali",
      last_name: "Rahmani",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg"
    },
    pet: {
      uuid: "p006",
      name: "Charlie",
      breed: "German Shepherd",
      avatar: "https://placedog.net/400/400?id=4",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Emergency Visit",
    appointment_date: new Date("2025-11-15"),
    start_time: "08:00",
    end_time: "08:45",
    duration_minutes: 45,
    status: "cancelled",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Injury to paw",
    appointment_notes: "Cancelled by client due to recovery at home.",
    created_at: "2025-10-30T10:15:00Z"
  },
  {
    uuid: "g7h8i9j0",
    client: {
      uuid: "c007",
      first_name: "Sophia",
      last_name: "Martin",
      avatar: "https://randomuser.me/api/portraits/women/48.jpg"
    },
    pet: {
      uuid: "p007",
      name: "Coco",
      breed: "Poodle",
      avatar: "https://placedog.net/400/400?id=5",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Video Consultation",
    appointment_date: new Date("2025-11-16"),
    start_time: "18:00",
    end_time: "18:30",
    duration_minutes: 30,
    status: "confirmed",
    is_video_conseil: true,
    video_meeting_id: "vid-002",
    video_join_url: "https://meet.vetapp.com/join/vid-002",
    reason_for_visit: "Skin irritation",
    appointment_notes: "Advised topical treatment.",
    created_at: "2025-10-31T18:00:00Z"
  },
  {
    uuid: "h8i9j0k1",
    client: {
      uuid: "c008",
      first_name: "Ahmed",
      last_name: "Bouhssini",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    pet: {
      uuid: "p008",
      name: "Toby",
      breed: "Labrador",
      avatar: "https://placedog.net/400/400?id=6",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Consultation",
    appointment_date: new Date("2025-11-17"),
    start_time: "15:00",
    end_time: "15:30",
    duration_minutes: 30,
    status: "confirmed",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Weight loss concern",
    appointment_notes: "Recommended diet adjustment.",
    created_at: "2025-11-01T09:00:00Z"
  },
  {
    uuid: "i9j0k1l2",
    client: {
      uuid: "c009",
      first_name: "Fatima",
      last_name: "Zahra",
      avatar: "https://randomuser.me/api/portraits/women/14.jpg"
    },
    pet: {
      uuid: "p009",
      name: "Kiki",
      breed: "Scottish Fold",
      avatar: "https://placedog.net/400/400?id=3",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Health Check",
    appointment_date: new Date("2025-11-18"),
    start_time: "13:00",
    end_time: "13:20",
    duration_minutes: 20,
    status: "pending",
    is_video_conseil: false,
    video_meeting_id: "",
    video_join_url: "",
    reason_for_visit: "Annual check-up",
    appointment_notes: "Awaiting confirmation.",
    created_at: "2025-11-01T12:30:00Z"
  },
  {
    uuid: "j0k1l2m3",
    client: {
      uuid: "c010",
      first_name: "David",
      last_name: "Nguyen",
      avatar: "https://randomuser.me/api/portraits/men/25.jpg"
    },
    pet: {
      uuid: "p010",
      name: "Max",
      breed: "Husky",
      avatar: "https://placedog.net/400/400?id=7",
            microchip:"#123FDS",
      species:"Dogs",
      gender:"Female",
      dob: new Date("2003-11-10"),
      wieght:15,
    },
    appointment_type: "Surgery Consultation",
    appointment_date: new Date("2025-11-19"),
    start_time: "17:00",
    end_time: "17:45",
    duration_minutes: 45,
    status: "confirmed",
    is_video_conseil: true,
    video_meeting_id: "vid-003",
    video_join_url: "https://meet.vetapp.com/join/vid-003",
    reason_for_visit: "Pre-surgery evaluation",
    appointment_notes: "Discussing anesthesia options.",
    created_at: "2025-11-02T11:45:00Z"
  }
];


const projects: Project[] = [
  {
    uid: 1,
    name: "Web Design",
    description: "Design Learn Management System",
    color: "info",
    category: "UI/UX Design",
    progress: 55.23,
    created_at: "June 08, 2021",
    teamMembers: [
      {
        uid: "5",
        name: "Katrina West",
        avatar: "/images/200x200.png",
      },
      {
        uid: "6",
        name: "Henry Curtis",
        avatar: "/images/200x200.png",
      },
      {
        uid: "7",
        name: "Raul Bradley",
        avatar: "/images/200x200.png",
      },
    ],
  },
  {
    uid: 2,
    name: "Mobile App",
    description: "Ecommerce Application",
    color: "secondary",
    category: "Ecommerce",
    progress: 14.84,
    created_at: "May 01, 2021",
    teamMembers: [
      {
        uid: "8",
        name: "Samantha Shelton",
        avatar: undefined,
      },
      {
        uid: "9",
        name: "Corey Evans",
        avatar: "/images/200x200.png",
      },
      {
        uid: "10",
        name: "Lance Tucker",
        avatar: undefined,
      },
    ],
  },
  {
    uid: 3,
    name: "Design System",
    description: "Create LMS design system on figma",
    color: "warning",
    category: "Figma",
    progress: 87.4,
    created_at: "September 16, 2021",
    teamMembers: [
      {
        uid: "6",
        name: "Henry Curtis",
        avatar: "/images/200x200.png",
      },
      {
        uid: "7",
        name: "Raul Bradley",
        avatar: "/images/200x200.png",
      },
      {
        uid: "8",
        name: "Samantha Shelton",
        avatar: undefined,
      },
    ],
  },
];

export function Projects() {
  return (
    <Card className="col-span-12 py-2">
      <div className="flex min-w-0 items-center justify-between px-4 py-3">
        <h2 className="dark:text-dark-100 min-w-0 font-medium tracking-wide text-gray-800">
          Today's Appointments
        </h2>
        {/* <ActionMenu /> */}
      </div>
            <div className="hide-scrollbar transition-content col-span-12 flex gap-4 overflow-x-auto px-(--margin-x) lg:col-span-9 lg:ltr:pl-0 lg:rtl:pr-0">
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment.uuid} appointment={appointment} />
              ))}
            </div>
      
    </Card>
  );
}

function ActionMenu() {
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
                <span>Action</span>
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
                <span>Another action</span>
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
                <span>Other action</span>
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
                <span>Separated action</span>
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
