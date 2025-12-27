// Import Dependencies
import { usePage } from "@inertiajs/react";

// Local Imports
import { Avatar } from "@/components/ui";
import { getUserAvatarUrl } from "@/utils/imageHelper";

// ----------------------------------------------------------------------

interface Client {
  id: number;
  firstname?: string;
  lastname?: string;
  avatar?: string | null;
}

interface RecentClientsAvatarsProps {
  recentClients?: Client[];
}

export function RecentClientsAvatars({ recentClients }: RecentClientsAvatarsProps) {
  const { props } = usePage();
  
  // Get recent clients from props or use demo data
  const clients: Client[] = recentClients || (props as any)?.recentClients || getDemoClients();
  
  // Get last 5 clients
  const last5Clients = clients.slice(0, 5);
  
  return (
    <div className="flex items-center gap-1.5">
      {last5Clients.map((client, index) => {
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
            size={10}
            src={avatarUrl}
            alt={name}
            className="cursor-pointer hover:ring-2 hover:ring-primary-500 dark:hover:ring-primary-400 transition-all"
            style={{
              marginLeft: index > 0 ? '-8px' : '0',
              zIndex: 5 - index,
            }}
          />
        );
      })}
    </div>
  );
}

// Demo data for development
function getDemoClients(): Client[] {
  return [
    { id: 1, firstname: "John", lastname: "Doe", avatar: null },
    { id: 2, firstname: "Jane", lastname: "Smith", avatar: null },
    { id: 3, firstname: "Bob", lastname: "Johnson", avatar: null },
    { id: 4, firstname: "Alice", lastname: "Williams", avatar: null },
    { id: 5, firstname: "Charlie", lastname: "Brown", avatar: null },
  ];
}

