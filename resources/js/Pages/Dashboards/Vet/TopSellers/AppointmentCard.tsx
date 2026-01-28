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

import { Avatar, Badge, Button, Card, Modal } from "@/components/ui";
import { Appointment } from "@/pages/Appointments/datatable/types";
import { useState, useEffect } from "react";
import PetDetailModal from "../modals/PetModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useRTL } from "@/hooks/useRTL";
import { useToast } from "@/components/common/Toast/ToastContext";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useInertiaAuth } from "@/hooks/useInertiaAuth";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const { t } = useTranslation();
  const { rtlClasses } = useRTL();
  const { showToast } = useToast();
  const { user } = useInertiaAuth();
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [creatingConsultation, setCreatingConsultation] = useState(false);
  const [canAccessMeeting, setCanAccessMeeting] = useState<boolean | null>(null);
  const [timeRemainingMessage, setTimeRemainingMessage] = useState<string | null>(null);
  const [showJoinButton, setShowJoinButton] = useState<boolean>(true);
  const [isAppointmentTimePast, setIsAppointmentTimePast] = useState<boolean>(false);
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
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [closingConsultation, setClosingConsultation] = useState(false);
    const [isConsultationEndTimePast, setIsConsultationEndTimePast] = useState(false);
  
    const handleCardClick = () => {
      setIsModalOpen(true);
      setConsultationId(appointment.consultation?.uuid || null);
    };
  
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    const autoCloseConsultation = async () => {
      if (!consultationId || appointment.consultation?.status === 'completed') {
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

        if (response.ok) {
          setConsultationId(null);
          setIsConsultationEndTimePast(true);
          
          showToast({
            type: 'success',
            message: t('common.consultation_closed') || 'Consultation closed successfully',
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error auto-closing consultation:', error);
      }
    };

    useEffect(() => {
      const checkAppointmentTime = () => {
        try {
          const appointmentDate = new Date(appointment.appointment_date);
          const [endHours, endMinutes] = appointment.end_time.split(':').map(Number);
          
          const appointmentEndDateTime = new Date(appointmentDate);
          appointmentEndDateTime.setHours(endHours, endMinutes, 0, 0);
          
          const now = new Date();
          setIsAppointmentTimePast(now > appointmentEndDateTime);
        } catch (error) {
          console.error('Error checking appointment time:', error);
          setIsAppointmentTimePast(false);
        }
      };

      checkAppointmentTime();
      
      const interval = setInterval(checkAppointmentTime, 60000);
      
      return () => clearInterval(interval);
    }, [appointment.appointment_date, appointment.end_time]);

    useEffect(() => {
      if (!consultationId || appointment.consultation?.status === 'completed') {
        setIsConsultationEndTimePast(false);
        return;
      }

      const checkConsultationEndTime = () => {
        try {
          const appointmentDate = new Date(appointment.appointment_date);
          const [endHours, endMinutes] = appointment.end_time.split(':').map(Number);
          
          const appointmentEndDateTime = new Date(appointmentDate);
          appointmentEndDateTime.setHours(endHours, endMinutes, 0, 0);
          
          const now = new Date();
          const hasEndTimePassed = now > appointmentEndDateTime;
          
          setIsConsultationEndTimePast(hasEndTimePassed);
          
          if (hasEndTimePassed) {
            autoCloseConsultation();
          }
        } catch (error) {
          console.error('Error checking consultation end time:', error);
        }
      };

      checkConsultationEndTime();
      
      const interval = setInterval(checkConsultationEndTime, 60000);
      
      return () => clearInterval(interval);
    }, [consultationId, appointment.appointment_date, appointment.end_time, appointment.consultation?.status]);

    useEffect(() => {
      if (!appointment.is_video_conseil || !appointment.video_join_url) {
        return;
      }

      const calculateTimeRemaining = () => {
        try {
          const appointmentDate = new Date(appointment.appointment_date);
          const [startHours, startMinutes] = appointment.start_time.split(':').map(Number);
          const [endHours, endMinutes] = appointment.end_time.split(':').map(Number);
          
          const appointmentStartDateTime = new Date(appointmentDate);
          appointmentStartDateTime.setHours(startHours, startMinutes, 0, 0);
          
          const appointmentEndDateTime = new Date(appointmentDate);
          appointmentEndDateTime.setHours(endHours, endMinutes, 0, 0);
          
          const earliestAccess = new Date(appointmentStartDateTime.getTime() - 5 * 60 * 1000); // 5 minutes before
          const latestAccess = new Date(appointmentEndDateTime.getTime() + 30 * 60 * 1000); // 30 minutes after end time
          
          const now = new Date();
          
          if (now > latestAccess) {
            setShowJoinButton(false);
            setCanAccessMeeting(false);
            setTimeRemainingMessage(null);
            return;
          }
          
          setShowJoinButton(true);
          
          if (now < earliestAccess) {
            const diffMs = earliestAccess.getTime() - now.getTime();
            const totalMinutes = diffMs / (1000 * 60);
            
            let message: string;
            if (totalMinutes > 60) {
              const hours = Math.floor(totalMinutes / 60);
              const remainingMinutes = Math.floor(totalMinutes % 60);
              const hoursUnit = hours === 1 ? 'hour' : 'hours';
              const minutesUnit = remainingMinutes === 1 ? 'minute' : 'minutes';
              
              if (remainingMinutes > 0) {
                message = `Meeting will be available in ${hours} ${hoursUnit} ${remainingMinutes} ${minutesUnit}`;
              } else {
                message = `Meeting will be available in ${hours} ${hoursUnit}`;
              }
            } else {
              const minutes = Math.floor(totalMinutes);
              const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
              const minutesUnit = minutes === 1 ? 'minute' : 'minutes';
              const secondsUnit = seconds === 1 ? 'second' : 'seconds';
              
              if (minutes > 0 && seconds > 0) {
                message = `Meeting will be available in ${minutes} ${minutesUnit} ${seconds} ${secondsUnit}`;
              } else if (minutes > 0) {
                message = `Meeting will be available in ${minutes} ${minutesUnit}`;
              } else {
                message = `Meeting will be available in ${seconds} ${secondsUnit}`;
              }
            }
            
            setCanAccessMeeting(false);
            setTimeRemainingMessage(message);
          } else {
            if (now >= earliestAccess && now <= latestAccess) {
              setCanAccessMeeting(true);
              setTimeRemainingMessage(null);
            } else {
              setCanAccessMeeting(false);
              setTimeRemainingMessage('Meeting time has passed');
            }
          }
        } catch (error) {
          console.error('Error calculating time remaining:', error);
          setCanAccessMeeting(false);
        }
      };

      calculateTimeRemaining();
      
      const interval = setInterval(calculateTimeRemaining, 1000);
      
      return () => clearInterval(interval);
    }, [appointment.uuid, appointment.is_video_conseil, appointment.video_join_url, appointment.appointment_date, appointment.start_time, appointment.end_time]);

    const handleCreateConsultation = async (e: React.MouseEvent) => {
      e.stopPropagation();
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

    const handleCloseConsultation = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      setShowCloseConfirmModal(true);
    };

    const handleConfirmCloseConsultation = async () => {
      setClosingConsultation(true);
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
          setConsultationId(null);
          setIsConsultationEndTimePast(true);
          setShowCloseConfirmModal(false);
          
          showToast({
            type: 'success',
            message: t('common.consultation_closed') || 'Consultation closed successfully',
            duration: 3000,
          });
        } else {
          throw new Error(data.message || 'Failed to close consultation');
        }
      } catch (error: any) {
        showToast({
          type: 'error',
          message: error.message || t('common.failed_to_close_consultation') || 'Failed to close consultation',
          duration: 3000,
        });
        setClosingConsultation(false);
      } finally {
        setClosingConsultation(false);
      }
    };

    const handleJoinMeeting = async (e: React.MouseEvent) => {
      e.stopPropagation(); 
      
      if (!appointment.video_join_url) {
        showToast({
          type: 'error',
          message: 'Meeting link not available',
          duration: 3000,
        });
        return;
      }

      if (canAccessMeeting === false) {
        showToast({
          type: 'error',
          message: timeRemainingMessage || 'Meeting is not available at this time',
          duration: 5000,
        });
        return;
      }

      setIsCheckingAccess(true);

      try {
        const trackResponse = await fetch(route('appointments.track-meeting-start', { uuid: appointment.uuid }), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'Accept': 'application/json',
          },
        });

        const trackData = await trackResponse.json();

        if (appointment.video_join_url) {
          window.location.href = appointment.video_join_url;
        } else {
          throw new Error('Meeting URL not available');
        }
      } catch (error) {
        console.error('Error joining meeting:', error);
        showToast({
          type: 'error',
          message: 'Failed to join meeting. Please try again.',
          duration: 3000,
        });
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
            <Badge 
              variant="soft" 
              color="primary"
              className="mb-2 text-xs font-semibold"
            >
              {appointment.appointment_type}
            </Badge>
            <p className="text-sm text-gray-500 dark:text-dark-300">{appointment.reason_for_visit}</p>
          </div>
  
          <div className="border-t border-gray-200 dark:border-dark-600 pt-4">
            <div className="flex items-center justify-start text-sm">
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
  
          {appointment.is_video_conseil && showJoinButton ? (
            <div className="mt-4">
              <Button
                color="primary"
                className="w-full"
                onClick={handleJoinMeeting}
                disabled={isCheckingAccess || canAccessMeeting === false}>
                <VideoCameraIcon
                  className={clsx("size-5", rtlClasses.mr("2"))}
                />
                {isCheckingAccess 
                  ? t("common.checking") || "Checking..."
                  : t("common.vet_dashboard.appointment_card.join_video_call")}
              </Button>
              {canAccessMeeting === false && timeRemainingMessage && (
                <p className="mt-2 text-xs text-gray-500 dark:text-dark-300 text-center">
                  {timeRemainingMessage}
                </p>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          {!consultationId && appointment.status !== 'cancelled' && appointment.status !== 'completed' && !appointment.is_video_conseil && !isAppointmentTimePast ? (
            <div className="mt-4 flex gap-2">
              <Button
                color="primary"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium"
                onClick={handleCreateConsultation}
                disabled={creatingConsultation}
              >
                <PlayIcon className="size-4" />
                <span>{t("common.start") || "Start"}</span>
              </Button>
              <button
                onClick={handleCancelAppointment}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all",
                  "text-sm font-medium",
                  "bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-600 border border-gray-200 dark:border-dark-600"
                )}>
                <XCircleIcon className="size-4" />
                <span>{t("common.cancel") || "Cancel"}</span>
              </button>
            </div>
          ) : null}
            
          {consultationId && appointment.consultation?.status !== 'completed' && !isConsultationEndTimePast ? (
            <div className="mt-4 flex gap-2">
              <Button
                color="error"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium"
                onClick={handleCloseConsultation}>
                <StopIcon className="size-4" />
                <span>{t("common.close") || "Close"}</span>
              </Button>
              <Button
                color="primary"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg transition-all text-sm font-medium"
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}>
                <PencilSquareIcon className="size-4" />
                <span>{t("common.details") || "View Details"}</span>
              </Button>
            </div>
          ) : null}
        </Card>
  
        <PetDetailModal
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          appointment={appointment}
          consultationId={consultationId}
        />

        <ConfirmModal
          show={showCloseConfirmModal}
          onClose={() => setShowCloseConfirmModal(false)}
          onOk={handleConfirmCloseConsultation}
          state="pending"
          confirmLoading={closingConsultation}
          messages={{
            pending: {
              title: t('common.are_you_sure') || 'Are you sure?',
              description: t('common.confirm_close_consultation') || 'Are you sure you want to close this consultation?',
              actionText: t('common.close_consultation') || 'Close Consultation',
            }
          }}
        />
      </>
    );
  }
