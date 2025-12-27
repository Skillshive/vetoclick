import { Card, Badge, Avatar } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { Link } from "@inertiajs/react";
import clsx from "clsx";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface RecentActivityProps {
  recentAppointments: Array<{
    uuid: string;
    date: string;
    time: string;
    status: string;
    client_name: string;
    pet_name: string;
    veterinarian_name: string;
  }>;
  recentUsers: Array<{
    uuid: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }>;
}

export function RecentActivity({ recentAppointments, recentUsers }: RecentActivityProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string): "primary" | "success" | "error" | "secondary" | "info" | "warning" => {
    switch (status) {
      case "confirmed":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      case "scheduled":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getRoleColor = (role: string): "primary" | "success" | "error" | "secondary" | "info" | "warning" => {
    switch (role) {
      case "admin":
        return "error";
      case "veterinarian":
        return "info";
      case "receptionist":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="grid grid-cols-1 ">
      {/* Recent Appointments 
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
            {t("common.recent_appointments") || "Recent Appointments"}
          </h3>
          <Link
            href={route("appointments.index")}
            className="text-xs-plus text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {t("common.view_all") || "View All"}
          </Link>
        </div>
        
        {recentAppointments.length === 0 ? (
          <div className="py-8 text-center">
            <ClockIcon className="mx-auto size-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("common.no_appointments") || "No appointments yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAppointments.map((appointment) => (
              <div
                key={appointment.uuid}
                className="flex items-start justify-between rounded-lg border border-gray-200 dark:border-dark-600 p-3 hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                      {appointment.pet_name}
                    </p>
                    <Badge
                      color={getStatusColor(appointment.status)}
                      variant="soft"
                      className="text-xs"
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {appointment.client_name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("common.veterinarian") || "Vet"}: {appointment.veterinarian_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>*/}

      {/* Recent Users */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
            {t("common.recent_users") || "Recent Users"}
          </h3>
          <Link
            href={route("users.index")}
            className="text-xs-plus text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {t("common.view_all") || "View All"}
          </Link>
        </div>
        
        {recentUsers.length === 0 ? (
          <div className="py-8 text-center">
            <UserIcon className="mx-auto size-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t("common.no_users") || "No users yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.uuid}
                className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-dark-600 p-3 hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                <Avatar
                  size={10}
                  name={user.name}
                  initialColor="auto"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-dark-100">
                      {user.name}
                    </p>
                    <Badge
                      color={getRoleColor(user.role)}
                      variant="soft"
                      className="text-xs"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

