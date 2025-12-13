// Import Dependencies
import clsx from "clsx";
import {
  VideoCameraIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/solid";

// Local Imports
import { Avatar, Button, Card, Modal } from "@/components/ui";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useState } from "react";
import PetDetailModal from "../modals/PetModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/common/Toast/ToastContext";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const { t } = useTranslation();
  const { rtlClasses } = useRTL();
  const { showToast } = useToast();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [creatingConsultation, setCreatingConsultation] = useState(false);
  // Only set consultationId if consultation exists and is not completed
  const [consultationId, setConsultationId] = useState<string | null>(
    appointment.consultation?.uuid && appointment.consultation?.status !== 'completed' 
      ? appointment.consultation.uuid 
      : null
  );

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
      setConsultationId(appointment.consultation?.uuid);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    const handleCreateConsultation = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      setCreatingConsultation(true);

      try {
        const response = await fetch(route('appointments.create-consultation', { uuid: appointment.uuid }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });

        const data = await response.json();

        if (response.ok) {
          setConsultationId(data.consultation_uuid);
          showToast({
            type: 'success',
            message: t('common.consultation_created') || 'Consultation created successfully',
            duration: 3000,
          });
          // Reload page to refresh appointment status
          window.location.reload();
        } else {
          throw new Error(data.message || 'Failed to create consultation');
        }
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error.message || t('common.failed_to_create_consultation') || 'Failed to create consultation',
          duration: 3000,
        });
      } finally {
        setCreatingConsultation(false);
      }
    };

    const handleCancelAppointment = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      if (!confirm(t('common.confirm_cancel_appointment') || 'Are you sure you want to cancel this appointment?')) {
        return;
      }

      try {
        const response = await fetch(route('appointments.cancel', { uuid: appointment.uuid }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });

        const data = await response.json();

        if (response.ok) {
          showToast({
            type: 'success',
            message: t('common.appointment_cancelled') || 'Appointment cancelled successfully',
            duration: 3000,
          });
          window.location.reload();
        } else {
          throw new Error(data.message || 'Failed to cancel appointment');
        }
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error.message || t('common.failed_to_cancel_appointment') || 'Failed to cancel appointment',
          duration: 3000,
        });
      }
    };

    const handleCloseConsultation = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click

      if (!confirm(t('common.confirm_close_consultation') || 'Are you sure you want to close this consultation?')) {
        return;
      }

      try {
        const response = await fetch(route('consultations.close', { uuid: appointment.consultation?.uuid }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
        });

        const data = await response.json();

        if (response.ok) {
          showToast({
            type: 'success',
            message: t('common.consultation_closed') || 'Consultation closed successfully',
            duration: 3000,
          });
          setConsultationId(null);
          window.location.reload();
        } else {
          throw new Error(data.message || 'Failed to close consultation');
        }
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error.message || t('common.failed_to_close_consultation') || 'Failed to close consultation',
          duration: 3000,
        });
      }
    };

    const handleJoinMeeting = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      
      if (!appointment.video_join_url) {
        showToast({
          type: 'error',
          message: 'Meeting link not available',
          duration: 3000,
        });
        return;
      }

      setIsCheckingAccess(true);

      try {
        // Check if meeting can be accessed
        const response = await fetch(route('appointments.check-meeting-access', { uuid: appointment.uuid }));
        const data = await response.json();

        if (data.can_access) {
          // Redirect to join meeting route which will validate and redirect to Jitsi
          window.location.href = route('appointments.join-meeting', { uuid: appointment.uuid });
        } else {
          showToast({
            type: 'error',
            message: data.message || 'Meeting is not available at this time',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error checking meeting access:', error);
        showToast({
          type: 'error',
          message: 'Failed to check meeting access. Please try again.',
          duration: 3000,
        });
      } finally {
        setIsCheckingAccess(false);
      }
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
  
          {appointment.is_video_conseil  ? (
            <div className="mt-4">
              <Button
                color="primary"
                className="w-full"
                onClick={handleJoinMeeting}
                disabled={isCheckingAccess}>
                <VideoCameraIcon
                  className={clsx("size-5", rtlClasses.mr("2"))}
                />
                {isCheckingAccess 
                  ? t("common.checking") || "Checking..."
                  : t("common.vet_dashboard.appointment_card.join_video_call")}
              </Button>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="mt-4 flex justify-center gap-2">
            {!consultationId && appointment.status !== 'cancelled' && appointment.status !== 'completed'  && !appointment.is_video_conseil  ? (
              <>
                <Button
                  color="primary"
                  isIcon
                  className="size-9"
                  onClick={handleCreateConsultation}
                  disabled={creatingConsultation}
                  title={t("common.create_consultation") || "Start Consultation"}>
                  <PlayIcon className="size-5" />
                </Button>
                <Button
                  color="error"
                  isIcon
                  className="size-9"
                  onClick={handleCancelAppointment}
                  title={t("common.cancel_appointment") || "Cancel"}>
                  <XCircleIcon className="size-5" />
                </Button>
              </>
            ) : null    }
            
            {consultationId && appointment.consultation?.status !== 'completed'  ? (
              <>
                <Button
                  color="success"
                  isIcon
                  className="size-9"
                  onClick={handleCloseConsultation}
                  title={t("common.close_consultation") || "Close Consultation"}>
                  <StopIcon className="size-5" />
                </Button>
                <Button
                  color="info"
                  isIcon
                  className="size-9"
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                  title={t("common.view_details") || "View Details"}>
                  <PencilSquareIcon className="size-5" />
                </Button>
              </>
            ) : null}
          </div>
        </Card>
  
        <PetDetailModal
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          appointment={appointment}
          consultationId={consultationId}
        />
      </>
    );
  }
