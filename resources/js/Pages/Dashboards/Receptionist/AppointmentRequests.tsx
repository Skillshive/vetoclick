import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, Button, Box } from "@/components/ui";
import { CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/common/Toast/ToastContext";
import { ConfirmModal } from '@/components/shared/ConfirmModal';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface AppointmentRequestsProps {
  appointments: Appointment[];
}

interface RequestCardProps {
  appointment: Appointment;
  onAccept: (uuid: string) => void;
  onReject: (uuid: string) => void;
  isProcessing: boolean;
}

function RequestCard({ appointment, onAccept, onReject, isProcessing }: RequestCardProps) {
  const { t } = useTranslation();
  
  return (
    <Box className="min-w-[280px] max-w-xs border-l-error border-4 border-transparent px-4 py-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Pet & Client Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar
            size={12}
            name={appointment.pet.name}
            src={appointment.pet.avatar}
            classNames={{ display: "mask is-squircle rounded-lg" }}
            initialColor="auto"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-800 dark:text-dark-100">
              {appointment.pet.name}
            </p>
            <p className="dark:text-dark-300 text-xs text-gray-400">
              {appointment.pet.species}{appointment.pet.breed ? ` • ${appointment.pet.breed}` : ''}
            </p>
            <p className="dark:text-dark-300 mt-1 text-sm text-gray-600">
              {appointment.client.first_name} {appointment.client.last_name}
            </p>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="dark:text-dark-100 text-sm font-medium text-gray-800">
              {t(appointment.appointment_type)}
            </p>
            {appointment.reason_for_visit && (
              <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500 line-clamp-1">
                {appointment.reason_for_visit}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Time & Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-dark-600 pt-3">
        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="size-4 text-gray-500 dark:text-gray-400" />
          <span className="font-semibold text-gray-800 dark:text-dark-100">
          {appointment.appointment_date} - {appointment.start_time} 
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            className="size-7 rounded-full"
            isIcon
            color="success"
            variant="soft"
            onClick={() => onAccept(appointment.uuid)}
            disabled={isProcessing}
            title={t("common.accept") || "Accept"}
          >
            <CheckIcon className="size-4" />
          </Button>
          <Button
            className="size-7 rounded-full"
            isIcon
            color="error"
            variant="soft"
            onClick={() => onReject(appointment.uuid)}
            disabled={isProcessing}
            title={t("common.reject") || "Reject"}
          >
            <XMarkIcon className="size-4" />
          </Button>
        </div>
      </div>
    </Box>
  );
}

export function AppointmentRequests({ appointments }: AppointmentRequestsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [appointmentToReject, setAppointmentToReject] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleAccept = (appointmentUuid: string) => {
    setProcessingId(appointmentUuid);
    router.post(route('appointments.accept', appointmentUuid), {}, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t('common.appointment_accepted') || 'Appointment accepted successfully',
          duration: 3000,
        });
        setProcessingId(null);
      },
      onError: (errors: any) => {
        showToast({
          type: 'error',
          message: errors.message || t('common.failed_to_accept_appointment') || 'Failed to accept appointment',
          duration: 3000,
        });
        setProcessingId(null);
      },
    });
  };

  const openRejectModal = (appointmentUuid: string) => {
    setAppointmentToReject(appointmentUuid);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (!rejectLoading) {
      setRejectModalOpen(false);
      setAppointmentToReject(null);
    }
  };

  const handleReject = async () => {
    if (!appointmentToReject) return;

    setRejectLoading(true);

    try {
      const response = await fetch(route('appointments.cancel', appointmentToReject), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        showToast({
          type: 'success',
          message: data.message || t('common.appointment_rejected') || 'Appointment rejected successfully',
          duration: 3000,
        });
        setRejectModalOpen(false);
        setAppointmentToReject(null);
        // Trigger a page reload or update via WebSocket if needed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('appointment.cancelled', {
            detail: { appointmentUuid: appointmentToReject }
          }));
        }
      } else {
        throw new Error(data.message || data.error || 'Failed to reject appointment');
      }
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('common.failed_to_reject_appointment') || 'Failed to reject appointment',
        duration: 3000,
      });
    } finally {
      setRejectLoading(false);
    }
  };

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 sm:mt-5 lg:mt-6">
      <div className="flex h-8 items-center justify-between">
        <h2 className="dark:text-dark-100 text-base font-medium tracking-wide text-gray-800">
          {t("common.appointment_requests") || "Appointment Requests"}
        </h2>
        <span className="text-xs-plus text-gray-500 dark:text-gray-400">
          {appointments.length} {t("common.pending") || "pending"}
        </span>
      </div>
      <div className="mt-3 hide-scrollbar flex flex-nowrap gap-4 overflow-x-auto overflow-y-hidden pb-2">
        {appointments.map((appointment) => (
          <RequestCard
            key={appointment.uuid}
            appointment={appointment}
            onAccept={handleAccept}
            onReject={openRejectModal}
            isProcessing={processingId === appointment.uuid}
          />
        ))}
      </div>

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        show={rejectModalOpen}
        onClose={closeRejectModal}
        onOk={handleReject}
        state="pending"
        confirmLoading={rejectLoading}
        messages={{
          pending: {
            description: t('common.confirm_cancel_appointment') || 'Are you sure you want to reject this appointment?',
            actionText: t('common.reject') || 'Reject',
          }
        }}
      />
    </div>
  );
}
