import { useTranslation } from '@/hooks/useTranslation';
import { Appointment } from './types';
import { Button, Modal } from '@/components/ui';

interface ReportModalProps {
  show: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function ReportModal({ show, onClose, appointment }: ReportModalProps) {
  const { t } = useTranslation();

  return (
    <Modal isOpen={show} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">{t('common.report_appointment')}</h2>
        <div className="mt-4">
          <p>{t('common.report_appointment_description')}</p>
          {/* Add date and time picker here */}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            {t('common.close')}
          </Button>
          <Button onClick={() => { /* Handle report logic */ }} className="ml-3">
            {t('common.report')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
