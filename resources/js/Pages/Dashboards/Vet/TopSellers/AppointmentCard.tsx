import {
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Avatar, Button, Card } from "@/components/ui";

// ----------------------------------------------------------------------

export interface DashboardAppointment {
  uuid: string;
  appointment_type: string;
  appointment_date?: string;
  start_time: string;
  end_time: string;
  status?: string | null;
  is_video_conseil: boolean;
  video_join_url?: string | null;
  video_start_url?: string | null;
  reason_for_visit?: string | null;
  appointment_notes?: string | null;
  client?: {
    first_name?: string | null;
    last_name?: string | null;
    avatar?: string | null;
  } | null;
  pet?: {
    name?: string | null;
    breed?: string | null;
    avatar?: string | null;
    profile_img?: string | null;
    gender?: string | null;
  } | null;
}

const fallbackAvatar =
  "https://ui-avatars.com/api/?size=128&rounded=true&background=4DB9AD&color=ffffff&name=Pet";

export function AppointmentCard({ appointment }: { appointment: DashboardAppointment }) {
  const pet = appointment.pet ?? {};
  const client = appointment.client ?? {};

  const StatusIcon = () => {
    switch (appointment.status) {
      case "confirmed":
        return <CheckCircleIcon className="size-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="size-5 text-yellow-500" />;
      case "completed":
        return <CheckBadgeIcon className="size-5 text-blue-500" />;
      case "cancelled":
        return <XCircleIcon className="size-5 text-red-500" />;
      default:
        return null;
    }
  };

  const joinUrl = appointment.video_start_url || appointment.video_join_url || "";

  return (
    <Card skin="shadow" className="w-80 shrink-0 space-y-4 p-5">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar
            size={12}
            name={pet.name ?? "Pet"}
            src={pet.avatar || pet.profile_img || fallbackAvatar}
            classNames={{ display: "mask is-squircle rounded-lg" }}
            initialColor="auto"
          />
          <div>
            <p className="text-lg font-bold text-gray-800 dark:text-dark-100">
              {pet.name ?? "Unnamed Pet"}
            </p>
            {pet.breed && (
              <p className="text-sm text-gray-500 dark:text-dark-300">{pet.breed}</p>
            )}
            <p className="text-sm text-gray-500 dark:text-dark-300">
              {[client.first_name, client.last_name].filter(Boolean).join(" ") || "Unknown client"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon />
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-700 dark:text-dark-200">
          {appointment.appointment_type}
        </h3>
        {appointment.reason_for_visit && (
          <p className="text-sm text-gray-500 dark:text-dark-300">
            {appointment.reason_for_visit}
          </p>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
        <div className="flex items-center justify-center text-sm">
          <ClockIcon className="size-5 mr-2 text-gray-500" />
          <span className="font-semibold text-gray-800 dark:text-dark-100">
            {appointment.start_time} - {appointment.end_time}
          </span>
        </div>
      </div>

      {appointment.is_video_conseil && (
        <div className="mt-4">
          <Button
            color="primary"
            className="w-full"
            disabled={!joinUrl}
            onClick={(event) => {
              event.stopPropagation();
              if (joinUrl) {
                window.open(joinUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <VideoCameraIcon className="size-5 mr-2" />
            Join Video Call
          </Button>
        </div>
      )}
    </Card>
  );
}
