// Import Dependencies
import clsx from "clsx";

// Local Imports
import { Avatar, Badge, Box } from "@/components/ui";
import { Project } from "./index";
import { getUserAvatarUrl } from "@/utils/imageHelper";

// ----------------------------------------------------------------------

interface Client {
  id: number;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
}

interface ProjectCardProps extends Project {
  recentClients?: Client[];
}

export function ProjectCard({
  name,
  description,
  color,
  category,
  progress,
  teamMembers,
  created_at,
  recentClients = [],
}: ProjectCardProps) {
  const progressParts = progress.toFixed(2).toString().split(".");
  return (
    <Box
      className={clsx(
        `this:${color}`,
        "border-l-this dark:border-l-this-light flex flex-col justify-between border-4 border-transparent px-4",
      )}
    >
      <div>
        <p className="dark:text-dark-100 text-base font-medium text-gray-800">
          {name}
        </p>
        <p className="dark:text-dark-300 text-xs text-gray-400">
          {description}
        </p>
        <Badge color={color} variant="outlined" className="mt-2">
          {category}
        </Badge>
      </div>
      <div className="mt-8">
        <div>
          <p>
            <span className="dark:text-dark-100 text-2xl font-medium text-gray-800">
              %{progressParts[0]}.
            </span>
            <span className="text-xs">{progressParts[1]}</span>
          </p>
          <p className="mt-1 text-xs">{created_at}</p>
        </div>
      </div>
      <div className="mt-8 flex items-center gap-2">
        <div className="flex -space-x-2.5">
          {recentClients.slice(0, 5).map((client, index) => {
            let avatarUrl = "/assets/default/person-placeholder.jpg";
            if (client.avatar) {
              try {
                avatarUrl = getUserAvatarUrl(client as any) || client.avatar || avatarUrl;
              } catch {
                avatarUrl = client.avatar || avatarUrl;
              }
            }
            
            const name = client.firstname && client.lastname 
              ? `${client.firstname} ${client.lastname}` 
              : `Client ${client.id}`;
            
            return (
              <Avatar
                key={client.id}
                src={avatarUrl}
                name={name}
                size={7}
                classNames={{
                  root: "origin-bottom transition-transform hover:z-10 hover:scale-125",
                  display: "dark:ring-dark-700 text-xs ring-2 ring-white",
                }}
                initialColor="auto"
                style={{
                  zIndex: 5 - index,
                }}
              />
            );
          })}
        </div>
      </div>
    </Box>
  );
}

