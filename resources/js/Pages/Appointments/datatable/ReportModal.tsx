import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Appointment } from './types';
import { DatePicker } from '@/components/shared/form/Datepicker';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function ReportModal({ show, onClose, appointment }: ReportModalProps) {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState(new Date());

  const handleReport = () => {
    if (appointment) {
      router.post(route('appointments.report', appointment.uuid), {
        appointment_date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().split(' ')[0],
      }, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const title = (
    <div className="flex items-center gap-2">
      <CalendarDaysIcon className="size-5" />
      {t('common.report_appointment')}
    </div>
  );

  const actions = (
    <>
      <Button onClick={onClose} variant="secondary">
        {t('common.close')}
      </Button>
      <Button onClick={handleReport} 
                color="primary"
                type="submit">
        {t('common.report')}
      </Button>
    </>
  );

  return (
    <Modal isOpen={show} onClose={onClose} title={title} actions={actions}>
      <div className="flex flex-col gap-4">
        <p className="text-gray-600 dark:text-gray-300">
          {t('common.report_appointment_description')}
        </p>
        <div>
          <label htmlFor="appointment_date" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('common.new_appointment_date')}
          </label>
          <DatePicker
            id="appointment_date"
            value={startDate}
            onChange={(dates) => setStartDate(dates[0])}
            options={{
              enableTime: true,
              dateFormat: "Y-m-d H:i",
            }}
            className="w-full"
          />
        </div>
      </div>
    </Modal>
  );
}