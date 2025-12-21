import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui";
import { router } from "@inertiajs/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export function AppointmentCreated() {
  const { t } = useTranslation();

  const handleViewAppointments = () => {
    router.visit(route('appointments.index'));
  };

  const handleCreateAnother = () => {
    router.visit(route('appointments.create'));
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-6">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
        {t('common.appointment_created_successfully')}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('common.appointments.form.created.success_message')}
      </p>
      <div className="mt-8 flex gap-3">
        <Button variant="outlined" onClick={handleViewAppointments}>
          {t('common.appointments.form.created.view_all')}
        </Button>
        <Button color="primary" onClick={handleCreateAnother}>
          {t('common.appointments.form.created.create_another')}
        </Button>
      </div>
    </div>
  );
}

