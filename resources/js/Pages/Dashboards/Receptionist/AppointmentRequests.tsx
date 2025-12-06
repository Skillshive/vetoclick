import { Appointment } from "@/pages/Appointments/datatable/types";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, Button, Card } from "@/components/ui";
import { CheckIcon, XMarkIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
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
    <Card className="space-y-4 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar 
          size={10} 
          name={appointment.pet.name} 
          src={appointment.pet.avatar} 
          initialColor="auto" 
        />

        <div className="flex-1 min-w-0">
          <h3 className="dark:text-dark-100 truncate font-medium text-gray-800">
            {appointment.pet.name}
          </h3>
          <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
            {appointment.pet.species}
          </p>
          <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-500">
            {appointment.client.first_name} {appointment.client.last_name}
          </p>
        </div>
      </div>
      
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(appointment.appointment_date).toLocaleDateString()}
        </p>
        <p className="dark:text-dark-100 text-xl font-medium text-gray-800">
          {appointment.start_time}
        </p>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {appointment.appointment_type}
        </p>
      </div>
      
      <div className="flex justify-between">
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
    </Card>
  );
}

export function AppointmentRequests({ appointments }: AppointmentRequestsProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [appointmentToReject, setAppointmentToReject] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleAccept = async (appointmentUuid: string) => {
    setProcessingId(appointmentUuid);
    try {
      const response = await fetch(route('appointments.accept', { uuid: appointmentUuid }), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        // Try to parse JSON error, but handle HTML responses
        let errorMessage = 'Failed to accept appointment';
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch {
          // If response is not JSON, it's likely an HTML error page
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      showToast({
        type: 'success',
        message: data.message || t('common.appointment_accepted') || 'Appointment accepted successfully',
        duration: 3000,
      });
      router.visit(window.location.href, { preserveScroll: true, preserveState: false });
    } catch (error: any) {
      showToast({
        type: 'error',
        message: error.message || t('common.failed_to_accept_appointment') || 'Failed to accept appointment',
        duration: 3000,
      });
    } finally {
      setProcessingId(null);
    }
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
      const response = await fetch(route('appointments.cancel', { uuid: appointmentToReject }), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!response.ok) {
        // Try to parse JSON error, but handle HTML responses
        let errorMessage = 'Failed to reject appointment';
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch {
          // If response is not JSON, it's likely an HTML error page
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      showToast({
        type: 'success',
        message: data.message || t('common.appointment_rejected') || 'Appointment rejected successfully',
        duration: 3000,
      });
      setRejectModalOpen(false);
      setAppointmentToReject(null);
      router.visit(window.location.href, { preserveScroll: true, preserveState: false });
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
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
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
