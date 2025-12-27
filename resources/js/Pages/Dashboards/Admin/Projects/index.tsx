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
import { ProjectCard } from "./ProjectCard";
import { ColorType } from "@/constants/app";

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

interface Client {
  id: number;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
}

interface ProjectsProps {
  topVeterinarians?: Array<{
    id: number;
    name: string;
    avatar?: string;
    appointments: number;
    clients: number;
    pets: number;
    progress: number;
  }>;
  recentClients?: Client[];
}

const colors: ColorType[] = ["info", "secondary", "warning"];

export function Projects({ topVeterinarians = [], recentClients = [] }: ProjectsProps) {
  const projects: Project[] = topVeterinarians.slice(0, 3).map((vet, index) => ({
    uid: vet.id,
    name: vet.name,
    description: `Veterinarian with ${vet.appointments} appointments`,
    color: colors[index] || "info",
    category: "Veterinarian",
    progress: vet.progress,
    created_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    teamMembers: [
      {
        uid: String(vet.id),
        name: vet.name,
        avatar: vet.avatar,
      },
    ],
  }));

  // Fill with default if less than 3
  while (projects.length < 3) {
    projects.push({
      uid: projects.length + 1,
      name: "No Data",
      description: "No active veterinarians",
      color: colors[projects.length] || "info",
      category: "N/A",
      progress: 0,
      created_at: new Date().toLocaleDateString(),
      teamMembers: [],
    });
  }

  return (
    <Card className="col-span-12 lg:col-span-8">
      <div className="flex min-w-0 items-center justify-between px-4 py-3">
        <h2 className="dark:text-dark-100 min-w-0 font-medium tracking-wide text-gray-800">
          Top Active Veterinarians
        </h2>
        <ActionMenu />
      </div>
      <div className="grid grid-cols-1 gap-y-4 pb-3 sm:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.uid} {...project} recentClients={recentClients} />
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

