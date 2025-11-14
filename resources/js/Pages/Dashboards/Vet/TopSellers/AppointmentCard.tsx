// Import Dependencies
import clsx from "clsx";
import {
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Button, Card, Modal } from "@/components/ui";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useState } from "react";
import PetDetailModal from "../modals/PetModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";

// ----------------------------------------------------------------------

export function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const { t } = useTranslation();
  const { rtlClasses } = useRTL();

  const StatusIcon = () => {
    switch (appointment.status) {
      case "confirmed":
        return <CheckCircleIcon className="size-5 text-[#4DB9AD]" />;
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

    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const handleCardClick = () => {
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };
  
    return (
      <>
        <Card skin="shadow" className="w-80 shrink-0 space-y-4 p-5 cursor-pointer" onClick={handleCardClick}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar
                size={12}
                name={appointment.pet.name}
                src={appointment.pet.avatar}
                classNames={{ display: "mask is-squircle rounded-lg" }}
                initialColor="auto"
              />
              <div>
                <p className="text-lg font-bold text-gray-800 dark:text-dark-100">
                  {appointment.pet.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  {appointment.pet.breed}
                </p>
                <p className="text-sm text-gray-500 dark:text-dark-300">
                  {appointment.client.first_name} {appointment.client.last_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon />
            </div>
          </div>
  
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-dark-200">{appointment.appointment_type}</h3>
            <p className="text-sm text-gray-500 dark:text-dark-300">{appointment.reason_for_visit}</p>
          </div>
  
          <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
            <div className="flex items-center justify-center text-sm">
              <ClockIcon
                className={clsx(
                  "size-5 text-gray-500",
                  rtlClasses.mr("2"),
                )}
              />
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
                onClick={() => window.open(appointment.video_join_url, '_blank')}>
                <VideoCameraIcon
                  className={clsx("size-5", rtlClasses.mr("2"))}
                />
                {t("common.vet_dashboard.appointment_card.join_video_call")}
              </Button>
            </div>
          )}
        </Card>
  
        <PetDetailModal
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          appointment={appointment} 
        />
      </>
    );
  }
